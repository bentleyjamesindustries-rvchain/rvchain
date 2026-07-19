'use client';

import { useState, useRef } from 'react';
import {
  X, Camera, ImagePlus, Trash2, Heart, MessagesSquare, Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { Park } from '@/lib/parks';
import { compressImageFile } from '@/lib/imageCompress';
import {
  UserProfile,
  ProfilePhotoType,
  countPhotosByType,
  canAddPhoto,
  addProfilePhoto,
  removeProfilePhoto,
  MAX_PHOTOS_PER_TYPE,
} from '@/lib/userProfile';
import { getOwnedBadges, getOwnedCards, loadKidsProgress } from '@/lib/kidsProgress';
import { getRarityColor, getRarityLabel } from '@/lib/kidsCards';
import { getRarityColor as badgeRarityColor, getRarityLabel as badgeRarityLabel } from '@/lib/trailBadges';
import ProfileAvatar from './ProfileAvatar';
import MyLittleExplorersPanel from './MyLittleExplorersPanel';

interface ProfileEditorProps {
  profile: UserProfile;
  profileUserId: string;
  /** Parent auth user id for family explorers (required for My Explorers tab) */
  parentUserId: string;
  userEmail?: string;
  favoritesCount: number;
  favoritedParks: Park[];
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
  onParkSelect: (park: Park) => void;
  onRemoveFavorite: (parkId: string) => void;
  onGoToForum: () => void;
  initialTab?: 'profile' | 'explorers';
}

function PhotoSection({
  title,
  description,
  type,
  photos,
  draft,
  onAdd,
  onRemove,
}: {
  title: string;
  description: string;
  type: ProfilePhotoType;
  photos: UserProfile['photos'];
  draft: UserProfile;
  onAdd: (type: ProfilePhotoType) => void;
  onRemove: (id: string) => void;
}) {
  const filtered = photos.filter((p) => p.type === type);
  const count = countPhotosByType(draft, type);

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => onAdd(type)}
        disabled={!canAddPhoto(draft, type)}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-600 hover:border-emerald-600 disabled:opacity-40 h-11 rounded-2xl text-sm font-medium text-slate-300 transition"
      >
        <ImagePlus className="w-4 h-4" />
        Add photo ({count}/{MAX_PHOTOS_PER_TYPE})
      </button>

      {filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((photo) => (
            <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
              <img src={photo.dataUrl} alt={photo.caption || title} className="w-full h-28 object-cover" />
              <button
                type="button"
                onClick={() => onRemove(photo.id)}
                className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/60 text-red-300 opacity-0 group-hover:opacity-100 transition"
                aria-label="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {photo.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-black/55 text-[10px] px-2 py-1 truncate">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfileEditor({
  profile,
  profileUserId,
  parentUserId,
  userEmail,
  favoritesCount,
  favoritedParks,
  onSave,
  onClose,
  onParkSelect,
  onRemoveFavorite,
  onGoToForum,
  initialTab = 'profile',
}: ProfileEditorProps) {
  const [tab, setTab] = useState<'profile' | 'explorers'>(initialTab);
  const [draft, setDraft] = useState<UserProfile>(profile);
  const kidsProg = loadKidsProgress(profileUserId);
  const trailCards = getOwnedCards(kidsProg).slice(0, 4);
  const trailBadges = getOwnedBadges(kidsProg).slice(0, 6);
  const [captionPrompt, setCaptionPrompt] = useState<ProfilePhotoType | null>(null);
  const [pendingCaption, setPendingCaption] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const pendingGalleryType = useRef<ProfilePhotoType>('trip');

  const handleSave = () => {
    const handle = draft.handle.trim();
    if (!handle) return toast.error('Choose a handle name.');
    if (handle.length < 2) return toast.error('Handle must be at least 2 characters.');
    onSave({ ...draft, handle });
    toast.success('Profile saved!');
  };

  const handleAvatarPick = async (file: File) => {
    try {
      const dataUrl = await compressImageFile(file, 400, 0.85, 250_000);
      setDraft((d) => ({ ...d, avatarUrl: dataUrl }));
      toast.success('Profile photo updated — save to keep it.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload photo.');
    }
  };

  const startGalleryUpload = (type: ProfilePhotoType) => {
    if (!canAddPhoto(draft, type)) {
      return toast.error(`Maximum ${MAX_PHOTOS_PER_TYPE} photos per section.`);
    }
    pendingGalleryType.current = type;
    galleryInputRef.current?.click();
  };

  const handleGalleryPick = async (file: File) => {
    const type = pendingGalleryType.current;
    try {
      const dataUrl = await compressImageFile(file, 1200, 0.8, 500_000);
      setCaptionPrompt(type);
      setPendingCaption('');
      (galleryInputRef.current as HTMLInputElement & { _pendingUrl?: string })._pendingUrl = dataUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload photo.');
    }
  };

  const confirmGalleryCaption = () => {
    const input = galleryInputRef.current as HTMLInputElement & { _pendingUrl?: string };
    const dataUrl = input._pendingUrl;
    if (!dataUrl || !captionPrompt) return;
    setDraft((d) => addProfilePhoto(d, captionPrompt, dataUrl, pendingCaption));
    input._pendingUrl = undefined;
    setCaptionPrompt(null);
    setPendingCaption('');
    toast.success('Photo added — save profile to keep it.');
  };

  return (
    <div
      className="modal bg-slate-900 w-full sm:max-w-lg sm:rounded-3xl border-t sm:border border-slate-700 rounded-t-3xl max-h-[92dvh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-5 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-xl">
            {tab === 'explorers' ? 'My Explorers' : 'Edit Profile'}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex p-1 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setTab('profile')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              tab === 'profile' ? 'bg-emerald-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Profile
          </button>
          <button
            type="button"
            onClick={() => setTab('explorers')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              tab === 'explorers' ? 'bg-amber-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Explorers
          </button>
        </div>
      </div>

      {tab === 'explorers' ? (
        <div className="p-5">
          <MyLittleExplorersPanel parentUserId={parentUserId} />
        </div>
      ) : (
      <div className="p-5 space-y-6">
        {/* Avatar + handle */}
        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
          <div className="relative shrink-0">
            <ProfileAvatar handle={draft.handle} avatarUrl={draft.avatarUrl} size="xl" />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-emerald-700 hover:bg-emerald-600 flex items-center justify-center border-2 border-slate-900"
              title="Change profile photo"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarPick(file);
                e.target.value = '';
              }}
            />
          </div>

          <div className="flex-1 w-full space-y-2">
            <label className="text-xs text-slate-400">Handle name</label>
            <input
              type="text"
              value={draft.handle}
              onChange={(e) => setDraft((d) => ({ ...d, handle: e.target.value }))}
              maxLength={32}
              placeholder="e.g. DesertNomad"
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-600 px-4 h-11 rounded-2xl text-sm outline-none"
            />
            <p className="text-[10px] text-slate-500">
              Shown on forum posts and in the header. {userEmail && <span className="text-slate-600">Signed in as {userEmail}</span>}
            </p>
            {draft.avatarUrl && (
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, avatarUrl: null }))}
                className="text-[10px] text-red-300 hover:underline"
              >
                Remove profile photo
              </button>
            )}
          </div>
        </div>

        {/* Galleries */}
        <PhotoSection
          title="Trip photos"
          description="Scenes from the road — campsites, views, and adventures."
          type="trip"
          photos={draft.photos}
          draft={draft}
          onAdd={startGalleryUpload}
          onRemove={(id) => setDraft((d) => removeProfilePhoto(d, id))}
        />

        <PhotoSection
          title="Setup & RV photos"
          description="Your rig, gear layout, mods, and campsite setup."
          type="setup"
          photos={draft.photos}
          draft={draft}
          onAdd={startGalleryUpload}
          onRemove={(id) => setDraft((d) => removeProfilePhoto(d, id))}
        />

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleGalleryPick(file);
            e.target.value = '';
          }}
        />

        {captionPrompt && (
          <div className="bg-slate-950 border border-slate-700 rounded-2xl p-4 space-y-2">
            <div className="text-sm font-medium">Add a caption (optional)</div>
            <input
              type="text"
              value={pendingCaption}
              onChange={(e) => setPendingCaption(e.target.value)}
              placeholder="e.g. Sunset at Red Mesa site 12"
              maxLength={80}
              className="w-full bg-slate-900 border border-slate-600 px-3 h-10 rounded-xl text-sm"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setCaptionPrompt(null); setPendingCaption(''); }}
                className="flex-1 h-10 rounded-xl border border-slate-600 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmGalleryCaption}
                className="flex-1 h-10 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-sm font-semibold"
              >
                Add photo
              </button>
            </div>
          </div>
        )}

        {/* Explorer Trail Badges showcase */}
        <div>
          <div className="text-sm font-medium mb-1">Trail Badge showcase</div>
          <p className="text-xs text-slate-400 mb-3">
            50 camping collector badges from Explorer packs · plants from scavenger hunts.
          </p>
          {trailBadges.length === 0 && trailCards.length === 0 ? (
            <p className="text-xs text-slate-500 py-2 border border-dashed border-slate-700 rounded-xl px-3">
              No badges yet — open Big Explorer, find a plant, then open a free pack.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {trailBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-xl p-[1.5px]"
                  style={{
                    background: `linear-gradient(145deg, ${badgeRarityColor(badge.rarity)}, #1e293b)`,
                  }}
                >
                  <div className="bg-slate-950 rounded-[10px] overflow-hidden text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={badge.imageSrc}
                      alt={badge.name}
                      className="w-full aspect-square object-cover"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        if (el.src.endsWith('.png')) el.src = badge.imageSrc.replace(/\.png$/, '.svg');
                      }}
                    />
                    <div className="p-1.5">
                      <div className="text-[10px] font-semibold text-slate-200 truncate">
                        {badge.name}
                      </div>
                      <div
                        className="text-[9px] font-medium"
                        style={{ color: badgeRarityColor(badge.rarity) }}
                      >
                        {badgeRarityLabel(badge.rarity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {trailCards.slice(0, Math.max(0, 3 - trailBadges.length)).map((card) => (
                <div
                  key={card.id}
                  className="rounded-xl p-[1.5px]"
                  style={{
                    background: `linear-gradient(145deg, ${getRarityColor(card.rarity)}, #1e293b)`,
                  }}
                >
                  <div className="bg-slate-950 rounded-[10px] p-2 text-center">
                    <div className="text-2xl">{card.emoji}</div>
                    <div className="text-[10px] font-semibold text-slate-200 truncate mt-0.5">
                      {card.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved stops */}
        <div>
          <div className="text-sm font-medium mb-2">
            My Saved Stops <span className="text-slate-400">({favoritesCount})</span>
          </div>
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
            {favoritedParks.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No saved stops yet.</p>
            ) : (
              favoritedParks.map((park) => (
                <div key={park.id} className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
                  <Heart className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{park.name}</div>
                  </div>
                  <button type="button" onClick={() => onParkSelect(park)} className="text-[10px] px-2 py-1 bg-white/10 rounded-lg">View</button>
                  <button type="button" onClick={() => onRemoveFavorite(park.id)} className="text-[10px] text-red-300">Remove</button>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => { onClose(); onGoToForum(); }}
          className="w-full flex items-center justify-center gap-2 text-sm py-3 border border-white/10 hover:bg-white/5 rounded-2xl"
        >
          <MessagesSquare className="w-4 h-4" />
          Go to Camper Forum
        </button>
      </div>
      )}

      {tab === 'profile' && (
      <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 p-4 flex gap-2">
        <button type="button" onClick={onClose} className="flex-1 h-11 rounded-2xl border border-slate-600 text-sm">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 h-11 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Profile
        </button>
      </div>
      )}
    </div>
  );
}