'use client';

import { useMemo, useRef, useState, type RefObject } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Images, LoaderCircle, Pencil, Search } from "lucide-react";

import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ListingCard } from "@/components/listing-card";
import { TalkButton } from "@/components/talk-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { generateAd, identifyPart } from "@/lib/identify-client";
import { SAMPLES } from "@/lib/catalog";
import { compressImage, urlToCompressedDataUrl } from "@/lib/image";
import { catLabel, condLabel, sampleLabel, surfaceLabel, t } from "@/lib/copy";
import { useAllListings, useListingsStore } from "@/lib/listings-store";
import { useRvStore } from "@/lib/rv-store";

import { matchIdentification } from "@/lib/search";
import {
  CONDITIONS,
  MAIN_TILES,
  RACE_TILES,
  inferCategory,
  inferRaceSurface,
  type Category,
  type Condition,
  type GeneratedAd,
  type Identification,
  type RaceSurface,
} from "@/lib/types";

import { cn, formatPrice } from "@/lib/utils";

export default function IdentifyPage() {
  const router = useRouter();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const listings = useAllListings();
  const addMine = useListingsStore((s) => s.addMine);
  const addPoints = useRvStore((s) => s.addPoints);
  const locale = useRvStore((s) => s.locale);
  const copy = t(locale);

  const [photo, setPhoto] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [idn, setIdn] = useState<Identification | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category | "unknown">("unknown");
  const [raceSurface, setRaceSurface] = useState<RaceSurface | null>(null);
  const [fitment, setFitment] = useState("");
  const [condition, setCondition] = useState<Condition>("used");
  const [priceDraft, setPriceDraft] = useState("");
  const [notes, setNotes] = useState("");
  const [editing, setEditing] = useState(false);
  const [ad, setAd] = useState<GeneratedAd | null>(null);
  const [adTitle, setAdTitle] = useState("");
  const [adPrice, setAdPrice] = useState("");
  const [adBody, setAdBody] = useState("");
  const [adLocation, setAdLocation] = useState("");
  const [listingBusy, setListingBusy] = useState(false);

  const matches = useMemo(() => {
    if (!idn) return [];
    const live: Identification = {
      ...idn,
      name,
      category,
      raceSurface: category === "racecar" ? raceSurface : null,
      fitment,
      conditionGuess: condition,
    };
    return matchIdentification(listings, live).slice(0, 3);
  }, [idn, listings, name, category, raceSurface, fitment, condition]);

  function resetToSnap() {
    setPhoto(null);
    setIdn(null);
    setNotes("");
    setAd(null);
    setEditing(false);
    setReading(false);
  }

  async function runIdentify(dataUrl: string) {
    setPhoto(dataUrl);
    setIdn(null);
    setAd(null);
    setReading(true);
    try {
      const result = await identifyPart(dataUrl);
      if (!result.ok) {
        toast.error(result.error);
        setPhoto(null);
        return;
      }
      const guessed = inferCategory(
        result.identification.category,
        result.identification.name,
        result.identification.summary,
        result.identification.partType,
        ...result.identification.tags,
      );
      const surface = inferRaceSurface(
        guessed,
        result.identification.raceSurface ?? "",
        result.identification.name,
        result.identification.summary,
        ...result.identification.tags,
      );
      setIdn({ ...result.identification, category: guessed, raceSurface: surface });
      setName(result.identification.name);
      setCategory(guessed);
      setRaceSurface(surface);
      setFitment(result.identification.fitment);
      setCondition(result.identification.conditionGuess);
      setPriceDraft(
        result.identification.estimatedHigh
          ? String(result.identification.estimatedHigh)
          : "",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : copy.toast.identifyFailed);
      setPhoto(null);
    } finally {
      setReading(false);
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (
      file.type &&
      !file.type.startsWith("image/") &&
      !/heic|heif/i.test(file.type) &&
      !/\.heic|\.heif$/i.test(file.name)
    ) {
      toast.error(copy.toast.choosePhoto);
      return;
    }
    try {
      const dataUrl = await compressImage(file);
      await runIdentify(dataUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : copy.toast.couldNotRead);
    }
  }

  async function onSample(src: string) {
    setReading(true);
    try {
      const dataUrl = await urlToCompressedDataUrl(src);
      await runIdentify(dataUrl);
    } catch {
      toast.error(copy.toast.couldNotLoadSample);
      setReading(false);
    }
  }

  function pickCategory(next: Category) {
    setCategory(next);
    if (next !== "racecar") setRaceSurface(null);
    setAd(null);
  }

  async function listPart() {
    if (!idn) return;
    if (category === "unknown") {
      toast.error(copy.toast.pickCategoryFirst);
      return;
    }
    if (category === "racecar" && !raceSurface) {
      toast.error(copy.toast.racecarNeedsSurface);
      return;
    }
    setListingBusy(true);
    const price = Number(priceDraft);
    try {
      const result = await generateAd({
          identification: {
            ...idn,
            name,
            category,
            raceSurface: category === "racecar" ? raceSurface : null,
            fitment,
            conditionGuess: condition,
          },
          notes,
          edits: {
            name,
            category,
            raceSurface: category === "racecar" ? raceSurface : null,
            fitment,
            condition,
            price: Number.isFinite(price) && price > 0 ? price : undefined,
          },
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setAd(result.ad);
      setAdTitle(result.ad.title);
      setAdPrice(String(result.ad.price));
      setAdBody(result.ad.description);
      setAdLocation(result.ad.location);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : copy.toast.couldNotWrite);
    } finally {
      setListingBusy(false);
    }
  }

  function publish() {
    if (!ad || !photo) return;
    const price = Number(adPrice);
    const listingId = crypto.randomUUID();
    addMine({
      id: listingId,
      source: "mine",
      title: adTitle.trim() || ad.title,
      description: adBody.trim() || ad.description,
      category: ad.category,
      raceSurface: ad.category === "racecar" ? ad.raceSurface : null,
      partType: ad.partType,
      fitment: ad.fitment,
      condition: ad.condition,
      price: Number.isFinite(price) ? price : ad.price,
      location: adLocation.trim(),
      photo,
      tags: ad.tags,
      highlights: ad.highlights,
      createdAt: Date.now(),
    });
    toast.success(copy.toast.listingPosted);
    addPoints(15);
    router.push(`/listings/${listingId}`);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6">
        {!photo ? (
          <Capture
            busy={reading}
            cameraRef={cameraRef}
            galleryRef={galleryRef}
            onFile={onFile}
            onSample={onSample}
          />
        ) : (
          <Workspace
            photo={photo}
            reading={reading}
            idn={idn}
            name={name}
            setName={setName}
            category={category}
            pickCategory={pickCategory}
            raceSurface={raceSurface}
            setRaceSurface={(s) => {
              setRaceSurface(s);
              setAd(null);
            }}
            fitment={fitment}
            setFitment={setFitment}
            condition={condition}
            setCondition={setCondition}
            priceDraft={priceDraft}
            setPriceDraft={setPriceDraft}
            notes={notes}
            setNotes={setNotes}
            editing={editing}
            setEditing={setEditing}
            matches={matches}
            ad={ad}
            adTitle={adTitle}
            setAdTitle={setAdTitle}
            adPrice={adPrice}
            setAdPrice={setAdPrice}
            adBody={adBody}
            setAdBody={setAdBody}
            adLocation={adLocation}
            setAdLocation={setAdLocation}
            listingBusy={listingBusy}
            onReshoot={resetToSnap}
            onList={() => void listPart()}
            onPublish={publish}
          />
        )}
      </div>
    </AppShell>
  );
}

function Capture({
  busy,
  cameraRef,
  galleryRef,
  onFile,
  onSample,
}: {
  busy: boolean;
  cameraRef: RefObject<HTMLInputElement | null>;
  galleryRef: RefObject<HTMLInputElement | null>;
  onFile: (file: File | undefined) => Promise<void>;
  onSample: (src: string) => Promise<void>;
}) {
  const locale = useRvStore((s) => s.locale);
  const copy = t(locale);
  const id = copy.identify;

  function takeFile(input: HTMLInputElement | null, file: File | undefined) {
    if (input) input.value = "";
    void onFile(file);
  }

  return (
    <div className="stagger-in space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          {id.kicker}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-none tracking-tight">
          {id.title}
        </h1>
        <p className="rv-copy mt-2 text-muted">{id.intro}</p>
      </div>

      <ol className="rv-glass space-y-2 rounded-3xl p-4 text-sm text-muted">
        <li>{id.step1}</li>
        <li>{id.step2}</li>
        <li>{id.step3}</li>
        <li>{id.step4}</li>
      </ol>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => takeFile(e.currentTarget, e.currentTarget.files?.[0])}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*"
        className="sr-only"
        onChange={(e) => takeFile(e.currentTarget, e.currentTarget.files?.[0])}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => cameraRef.current?.click()}
          className="flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-3xl rv-glass px-6 text-center transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-border-hover)]"
        >
          <span className="grid size-16 place-items-center rounded-full bg-primary text-primary-fg">
            <Camera className="size-7" />
          </span>
          <span className="font-display text-2xl font-semibold">{id.takePhoto}</span>
          <span className="text-sm text-muted">{id.rearCamera}</span>
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => galleryRef.current?.click()}
          className="flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-3xl rv-glass px-6 text-center transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-border-hover)]"
        >
          <span className="grid size-16 place-items-center rounded-full bg-elevated text-fg">
            <Images className="size-7" />
          </span>
          <span className="font-display text-2xl font-semibold">{id.gallery}</span>
          <span className="text-sm text-muted">{id.galleryHint}</span>
        </button>
      </div>

      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-subtle">
        <span className="h-px flex-1 bg-border" />
        {id.trySample}
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            disabled={busy}
            onClick={() => void onSample(sample.photo)}
            className="overflow-hidden rounded-2xl rv-glass text-left"
          >
            <img
              src={sample.photo}
              alt={sampleLabel(locale, sample.id)}
              className="aspect-square w-full object-cover"
            />
            <span className="block px-2 py-1.5 text-xs text-muted">
              {sampleLabel(locale, sample.id)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Workspace({
  photo,
  reading,
  idn,
  name,
  setName,
  category,
  pickCategory,
  raceSurface,
  setRaceSurface,
  fitment,
  setFitment,
  condition,
  setCondition,
  priceDraft,
  setPriceDraft,
  notes,
  setNotes,
  editing,
  setEditing,
  matches,
  ad,
  adTitle,
  setAdTitle,
  adPrice,
  setAdPrice,
  adBody,
  setAdBody,
  adLocation,
  setAdLocation,
  listingBusy,
  onReshoot,
  onList,
  onPublish,
}: {
  photo: string;
  reading: boolean;
  idn: Identification | null;
  name: string;
  setName: (v: string) => void;
  category: Category | "unknown";
  pickCategory: (c: Category) => void;
  raceSurface: RaceSurface | null;
  setRaceSurface: (s: RaceSurface) => void;
  fitment: string;
  setFitment: (v: string) => void;
  condition: Condition;
  setCondition: (v: Condition) => void;
  priceDraft: string;
  setPriceDraft: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  editing: boolean;
  setEditing: (v: boolean) => void;
  matches: ReturnType<typeof matchIdentification>;
  ad: GeneratedAd | null;
  adTitle: string;
  setAdTitle: (v: string) => void;
  adPrice: string;
  setAdPrice: (v: string) => void;
  adBody: string;
  setAdBody: (v: string) => void;
  adLocation: string;
  setAdLocation: (v: string) => void;
  listingBusy: boolean;
  onReshoot: () => void;
  onList: () => void;
  onPublish: () => void;
}) {
  const locale = useRvStore((s) => s.locale);
  const copy = t(locale);
  const id = copy.identify;
  const confidence = idn ? Math.round(idn.confidence * 100) : 0;
  const marketParams = new URLSearchParams();
  if (name) marketParams.set("q", name);
  if (category !== "unknown") marketParams.set("cat", category);
  if (category === "racecar" && raceSurface) marketParams.set("surface", raceSurface);
  const marketHref = marketParams.toString() ? `/market?${marketParams}` : "/market";

  return (
    <div className="space-y-6">
      <img src={photo} alt="" className="aspect-[4/3] w-full rounded-3xl object-cover" />

      {reading || !idn ? (
        <div className="flex items-center gap-3 text-muted">
          <LoaderCircle className="size-5 animate-spin" />
          <p className="shimmer bg-clip-text font-display text-xl font-semibold text-transparent">
            {id.writing}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                {id.summary}
              </p>
              <h1 className="mt-1 font-display text-3xl font-semibold leading-tight tracking-tight">
                {idn.name}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {confidence}% · {formatPrice(idn.estimatedLow)}–{formatPrice(idn.estimatedHigh)}
              </p>
            </div>
            <Badge tone={confidence >= 70 ? "success" : "default"}>{id.guess}</Badge>
          </div>
          <p className="text-sm leading-relaxed text-fg/90">{idn.summary}</p>

          <ol className="rv-glass space-y-2 rounded-3xl p-4 text-sm text-muted">
            <li>{id.wsStep1}</li>
            <li>{id.wsStep2}</li>
            <li>{id.wsStep3}</li>
          </ol>

          <TalkButton value={notes} onChange={setNotes} />

          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
              {id.transcript}
            </span>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={id.transcriptPh}
              className="min-h-28"
            />
          </label>

          <fieldset className="space-y-3">
            <legend className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
              {id.mainCategory}
            </legend>
            <p className="text-sm text-muted">{id.mainCategoryHint}</p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {MAIN_TILES.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => pickCategory(tile.id)}
                  className={cn(
                    "relative aspect-[4/3] overflow-hidden rounded-2xl text-left shadow-[var(--shadow-border)]",
                    category === tile.id && "ring-2 ring-primary shadow-[var(--shadow-border-hover)]",
                  )}
                >
                  <img src={tile.src} alt="" className="size-full object-cover" />
                  <span className="absolute inset-0 bg-gradient-to-t from-bg/50 to-transparent" />
                  <span className="absolute bottom-2 left-2 font-display text-lg font-semibold">
                    {catLabel(locale, tile.id)}
                  </span>
                </button>
              ))}
            </div>
            {category === "racecar" ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
                  {id.racingSurface}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {RACE_TILES.map((tile) => (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => setRaceSurface(tile.id)}
                      className={cn(
                        "relative aspect-[4/3] overflow-hidden rounded-2xl text-left shadow-[var(--shadow-border)]",
                        raceSurface === tile.id &&
                          "ring-2 ring-primary shadow-[var(--shadow-border-hover)]",
                      )}
                    >
                      <img src={tile.src} alt="" className="size-full object-cover" />
                      <span className="absolute inset-0 bg-gradient-to-t from-bg/50 to-transparent" />
                      <span className="absolute bottom-2 left-1 font-display text-sm font-semibold sm:left-2 sm:text-lg">
                        {surfaceLabel(locale, tile.id)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </fieldset>

          <Button
            variant={editing ? "secondary" : "outline"}
            className="w-full"
            onClick={() => setEditing(!editing)}
          >
            <Pencil />
            {editing ? id.hideDetails : id.editDetails}
          </Button>

          {editing ? (
            <div className="space-y-3 rounded-3xl rv-glass p-4 sm:p-5">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
                  {id.partName}
                </span>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
                  {id.fitment}
                </span>
                <Input value={fitment} onChange={(e) => setFitment(e.target.value)} />
              </label>
              <fieldset className="space-y-1.5">
                <legend className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
                  {id.condition}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCondition(c)}
                      className={cn(
                        "h-9 rounded-full px-3 text-sm",
                        condition === c ? "bg-primary text-primary-fg" : "bg-elevated text-muted",
                      )}
                    >
                      {condLabel(locale, c)}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
                  {id.askingPrice}
                </span>
                <Input
                  inputMode="numeric"
                  value={priceDraft}
                  onChange={(e) => setPriceDraft(e.target.value.replace(/[^\d]/g, ""))}
                />
              </label>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="secondary" size="lg" className="flex-1">
              <Link href={marketHref}>
                <Search />
                {id.searchBoard}
              </Link>
            </Button>
            <Button className="flex-1" size="lg" onClick={onList} disabled={listingBusy}>
              {listingBusy ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  {id.writingListing}
                </>
              ) : (
                id.listPart
              )}
            </Button>
          </div>

          {ad ? (
            <div className="space-y-4 rounded-3xl rv-glass p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                {id.readyToPost}
              </p>
              <p className="text-sm text-muted">
                {catLabel(locale, ad.category)}
                {ad.raceSurface ? ` · ${surfaceLabel(locale, ad.raceSurface)}` : ""}
              </p>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
                  {id.adTitle}
                </span>
                <Input value={adTitle} onChange={(e) => setAdTitle(e.target.value)} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
                    {id.price}
                  </span>
                  <Input
                    inputMode="numeric"
                    value={adPrice}
                    onChange={(e) => setAdPrice(e.target.value.replace(/[^\d]/g, ""))}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
                    {id.pickup}
                  </span>
                  <Input
                    value={adLocation}
                    onChange={(e) => setAdLocation(e.target.value)}
                    placeholder={id.pickupPh}
                  />
                </label>
              </div>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
                  {id.listing}
                </span>
                <Textarea
                  className="min-h-36"
                  value={adBody}
                  onChange={(e) => setAdBody(e.target.value)}
                />
              </label>
              <Button className="w-full" size="lg" onClick={onPublish}>
                {id.postListing}
              </Button>
            </div>
          ) : null}

          <Button variant="ghost" className="w-full" onClick={onReshoot}>
            {id.reshoot}
          </Button>

          {matches.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">{id.onTheBoard}</h2>
                <Link
                  href={marketHref}
                  className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
                >
                  <Search className="size-3.5" /> {copy.market}
                </Link>
              </div>
              <div className="grid gap-3">
                {matches.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}