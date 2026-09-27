import { useEffect, useState } from "react";
import Icon, { type IconName } from "../components/Icon";
import { MapBg } from "../components/MapPicker";
import {
  Button, ConfirmDialog, EmptyState, formatDecimal, formatNumber, formatPrice, Modal, Tabs, Toggle, UploadTile, type UploadState, formatId } from "../components/ui";
import {
  extendedTechnicians, incomingRequests, settlements, specialtyOptions, techJobs, techNotifications, tehranAreas,
  type IncomingRequest, type TechJob,
} from "../data/mock";
import { isValidNationalCode, isValidSheba } from "../lib/validation";
import { useApp } from "../state";
import { LoginFlow } from "./AccountScreens";

type View = "home" | "request" | "job" | "requests" | "earnings" | "profile" | "notifications";
type AccountState = "onboarding" | "pending" | "approved" | "rejected" | "suspended" | "blocked";
type JobStage = "accepted" | "enroute" | "working" | "finished" | "paid";
type ActiveJob = { request: IncomingRequest; stage: JobStage; quote: { labor: number; parts: { name: string; price: number }[] } | null; quoteApproved: boolean; afterPhotos: number };

const COMMISSION = 0.12;
const me = extendedTechnicians[0];

// ─────────────────────────────────────────────
// Shell
// ─────────────────────────────────────────────

export default function TechnicianApp() {
  const { techEntry, toast } = useApp();
  const [account, setAccount] = useState<AccountState>(techEntry === "onboarding" ? "onboarding" : "approved");
  const [view, setView] = useState<View>("home");
  const [online, setOnline] = useState(true);
  const [requests, setRequests] = useState(incomingRequests);
  const [openRequestId, setOpenRequestId] = useState<number | null>(null);
  const [job, setJob] = useState<ActiveJob | null>(null);
  const [history, setHistory] = useState<TechJob[]>(techJobs.filter((item) => item.status !== "active"));
  const [now, setNow] = useState(() => Date.now());
  const [startedAt] = useState(() => Date.now());
  const [rejecting, setRejecting] = useState<IncomingRequest | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const secondsLeft = (request: IncomingRequest) => Math.max(0, request.expiresIn - Math.floor((now - startedAt) / 1000));
  const go = (next: View) => { setView(next); window.scrollTo({ top: 0 }); };

  const accept = (request: IncomingRequest) => {
    if (job) { toast("ابتدا کار فعال فعلی را تمام کنید"); return; }
    setRequests((list) => list.filter((item) => item.id !== request.id));
    setJob({ request, stage: "accepted", quote: null, quoteApproved: false, afterPhotos: 0 });
    toast("درخواست پذیرفته شد؛ آدرس دقیق برای شما باز شد");
    go("job");
  };

  const reject = (request: IncomingRequest, reason: string) => {
    setRequests((list) => list.filter((item) => item.id !== request.id));
    setHistory((list) => [{ id: request.id, service: `${request.service} ${request.device}`, customer: request.customer, area: request.area, date: "امروز", status: "rejected", fee: request.estimate, commissionRate: COMMISSION, reason }, ...list]);
    toast("درخواست رد شد");
    if (view === "request") go("home");
  };

  const finishJob = () => {
    if (!job) return;
    const fee = job.quote ? job.quote.labor + job.quote.parts.reduce((sum, part) => sum + part.price, 0) : job.request.estimate;
    setHistory((list) => [{ id: job.request.id, service: `${job.request.service} ${job.request.device}`, customer: job.request.customer, area: job.request.area, date: "امروز", status: "done", fee, commissionRate: COMMISSION }, ...list]);
    setJob(null);
    toast("کار تکمیل شد؛ مبلغ در تسویه بعدی واریز می‌شود");
    go("home");
  };

  if (account !== "approved") return <Onboarding key={account} state={account} setState={setAccount} />;

  const status: "آنلاین" | "آفلاین" | "مشغول" = job ? "مشغول" : online ? "آنلاین" : "آفلاین";
  const openRequest = requests.find((item) => item.id === openRequestId);
  const unread = techNotifications.filter((item) => item.unread).length;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-xl">
        <div className="tech-wrap flex h-16 items-center gap-3">
          <span className="brand-mark size-10"><Icon name="tool" /></span>
          <div className="min-w-0 flex-1"><div className="text-sm font-black">حنیفی — اپ نصاب</div><div className="flex items-center gap-1.5 text-xs text-muted"><span className={`size-2 rounded-full ${status === "آنلاین" ? "bg-success" : status === "مشغول" ? "bg-red-500" : "bg-faint"}`} />{me.name} · {status}</div></div>
          <Button className="icon-action relative" onClick={() => go("notifications")} label="اعلان‌ها"><Icon name="bell" />{unread > 0 && <span className="notification-dot" />}</Button>
        </div>
      </header>

      <main className="tech-wrap pb-28 pt-5">
        {view === "home" && (
          <TechHome status={status} online={online} setOnline={setOnline} job={job} requests={requests} secondsLeft={secondsLeft}
            open={(id) => { setOpenRequestId(id); go("request"); }} accept={accept} askReject={setRejecting} openJob={() => go("job")} history={history} />
        )}
        {view === "request" && (openRequest
          ? <RequestDetail request={openRequest} seconds={secondsLeft(openRequest)} back={() => go("home")} accept={() => accept(openRequest)} reject={() => setRejecting(openRequest)} />
          : <EmptyState icon="tool" text="این درخواست دیگر در دسترس نیست" action="بازگشت" onClick={() => go("home")} />)}
        {view === "job" && (job ? <JobScreen job={job} setJob={setJob} finish={finishJob} back={() => go("home")} /> : <EmptyState icon="tool" text="کار فعالی ندارید" action="بازگشت به خانه" onClick={() => go("home")} />)}
        {view === "requests" && <TechRequests job={job} history={history} openJob={() => go("job")} />}
        {view === "earnings" && <Earnings history={history} />}
        {view === "profile" && <TechProfile setAccount={setAccount} />}
        {view === "notifications" && <TechNotificationsList back={() => go("home")} />}
      </main>

      <nav className="mobile-nav tech-nav">
        {([["home", "home", "خانه"], ["requests", "orders", "درخواست‌ها"], ["earnings", "wallet", "درآمد"], ["profile", "user", "پروفایل"]] as [View, IconName, string][]).map(([key, icon, label]) => (
          <Button key={key} className={`mobile-nav-item ${view === key || (key === "home" && (view === "request" || view === "job")) ? "text-brand" : ""}`} onClick={() => go(key)}><Icon name={icon} /><span>{label}</span></Button>
        ))}
      </nav>

      <ConfirmDialog open={Boolean(rejecting)} onClose={() => setRejecting(null)} title="رد درخواست" text="دلیل رد به مشتری نمایش داده نمی‌شود و فقط برای بهبود پیشنهادها استفاده می‌شود." confirmLabel="رد درخواست" danger
        reasons={["خارج از محدوده فعالیت من", "در زمان درخواستی وقت ندارم", "تخصص این کار را ندارم", "فاصله زیاد است"]}
        onConfirm={(reason) => rejecting && reject(rejecting, reason)} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Home
// ─────────────────────────────────────────────

function Countdown({ seconds }: { seconds: number }) {
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  const urgent = seconds < 60;
  return (
    <span className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-black tabular-nums ${seconds === 0 ? "bg-canvas text-muted" : urgent ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>
      <Icon name="clock" size="sm" />{seconds === 0 ? "مهلت تمام شد" : `${formatNumber(mm)}:${ss.toLocaleString("fa-IR", { minimumIntegerDigits: 2 })}`}
    </span>
  );
}

function TechHome({ status, online, setOnline, job, requests, secondsLeft, open, accept, askReject, openJob, history }: {
  status: string; online: boolean; setOnline: (value: boolean) => void; job: ActiveJob | null; requests: IncomingRequest[]; secondsLeft: (r: IncomingRequest) => number;
  open: (id: number) => void; accept: (r: IncomingRequest) => void; askReject: (r: IncomingRequest) => void; openJob: () => void; history: TechJob[];
}) {
  const doneToday = history.filter((item) => item.status === "done" && item.date === "امروز");
  const earnedToday = doneToday.reduce((sum, item) => sum + Math.round(item.fee * (1 - item.commissionRate)), 0);
  return (
    <>
      <div className={`status-panel ${status === "مشغول" ? "bg-brand shadow-brand/20" : status === "آفلاین" ? "bg-neutral-500 shadow-none" : ""}`}>
        <div>
          <div className="text-sm text-white/70">وضعیت فعالیت</div>
          <div className="mt-1 text-xl font-black text-white">{status === "مشغول" ? "🔴 مشغول انجام کار" : status === "آنلاین" ? "🟢 آنلاین و آماده دریافت کار" : "⚪ آفلاین"}</div>
          <div className="mt-1 text-xs text-white/70">{status === "مشغول" ? "تا پایان کار فعلی، درخواست جدید برای شما ارسال نمی‌شود." : status === "آنلاین" ? "مشتریان محدوده شما را روی نقشه می‌بینند (به صورت تقریبی)." : "درخواستی دریافت نمی‌کنید و روی نقشه نمایش داده نمی‌شوید."}</div>
        </div>
        {status !== "مشغول" && (
          <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold text-white">
            {online ? "آنلاین" : "آفلاین"}<Toggle checked={online} onChange={setOnline} label="وضعیت آنلاین" />
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat icon="tool" value={formatNumber(requests.length)} label="درخواست باز" />
        <Stat icon="wallet" value={earnedToday ? formatNumber(earnedToday) : "۰"} label="درآمد امروز (تومان)" />
        <Stat icon="star" value={formatDecimal(me.rating)} label="امتیاز شما" />
      </div>

      {job && (
        <Button className="surface-card mt-5 block w-full border-red-200 text-right" onClick={openJob}>
          <div className="flex items-center justify-between"><span className="text-xs font-black text-red-600">کار فعال</span><span className="status-pill bg-red-50 text-red-600">{jobStageLabel[job.stage]}</span></div>
          <div className="mt-2 font-black">{job.request.service} {job.request.device}</div>
          <div className="mt-1 text-sm text-muted">{job.request.customer} · {job.request.area}</div>
          <div className="mt-3 flex items-center gap-1 text-sm font-bold text-brand">ادامه کار <Icon name="arrow" size="sm" /></div>
        </Button>
      )}

      <div className="mb-3 mt-7 flex items-center justify-between"><div className="text-lg font-black">درخواست‌های جدید</div>{online && !job && <span className="text-xs text-muted">در محدوده شمال و غرب تهران</span>}</div>
      {!online && !job ? (
        <EmptyState icon="pause" text="شما آفلاین هستید" hint="برای دریافت درخواست‌های محدوده خود، وضعیت را آنلاین کنید." action="آنلاین شوم" onClick={() => setOnline(true)} />
      ) : job ? (
        <div className="surface-card text-sm text-muted">تا پایان کار فعال، درخواست جدید نمایش داده نمی‌شود.</div>
      ) : requests.length === 0 ? (
        <EmptyState icon="check" text="درخواست بازی نیست" hint="درخواست‌های جدید محدوده شما همین‌جا و با اعلان نمایش داده می‌شوند." />
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const seconds = secondsLeft(request);
            return (
              <div key={request.id} className={`surface-card ${seconds === 0 ? "opacity-60" : ""}`}>
                <Button className="block w-full text-right" onClick={() => open(request.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><div className="text-xs font-bold text-brand">درخواست {formatId(request.id)}</div><div className="mt-1 font-black">{request.service} · {request.device}</div></div>
                    <Countdown seconds={seconds} />
                  </div>
                  <div className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{request.problem}</div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                    <span className="flex items-center gap-1"><Icon name="pin" size="sm" />{request.area} · حدود {formatDecimal(request.distance)} کیلومتر</span>
                    <span className="flex items-center gap-1"><Icon name="clock" size="sm" />{request.time}</span>
                    {request.photos.length > 0 && <span className="flex items-center gap-1"><Icon name="camera" size="sm" />{formatNumber(request.photos.length)} عکس</span>}
                  </div>
                </Button>
                <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
                  <span className="text-xs text-muted">برآورد</span><span className="font-black">{formatPrice(request.estimate)}</span>
                  <Button className="secondary-button mr-auto h-10 px-4 text-sm" disabled={seconds === 0} onClick={() => askReject(request)}>رد</Button>
                  <Button className="primary-button h-10 px-5 text-sm" disabled={seconds === 0} onClick={() => accept(request)}>قبول</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function RequestDetail({ request, seconds, back, accept, reject }: { request: IncomingRequest; seconds: number; back: () => void; accept: () => void; reject: () => void }) {
  return (
    <>
      <div className="mb-5 flex items-center gap-3">
        <Button className="icon-action" onClick={back} label="بازگشت"><Icon name="back" /></Button>
        <div className="flex-1"><div className="text-lg font-black">درخواست {formatId(request.id)}</div><div className="text-xs text-muted">{request.service} · {request.device}</div></div>
        <Countdown seconds={seconds} />
      </div>
      <div className="surface-card">
        <div className="text-sm font-black">شرح مشکل</div>
        <div className="mt-2 text-sm leading-7 text-muted">{request.problem}</div>
        {request.photos.length > 0 && <div className="mt-4 flex gap-2">{request.photos.map((src) => <img key={src} src={src} alt="عکس ارسالی مشتری" className="size-24 rounded-xl object-cover" />)}</div>}
      </div>
      <div className="surface-card mt-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label="نوع خدمت" value={request.service} /><Info label="دستگاه" value={request.device} />
          <Info label="زمان درخواستی" value={request.time} /><Info label="برآورد اولیه" value={formatPrice(request.estimate)} />
        </div>
      </div>
      <MapBg className="mt-3 h-44">
        <div className="tech-zone tech-zone-online" style={{ left: "50%", top: "50%", width: 120, height: 120 }}><span className="rounded-full bg-white px-2 py-1 text-xs font-black shadow">{request.area}</span></div>
        <div className="absolute bottom-2 right-2 rounded-xl bg-white/95 px-3 py-2 text-xs font-bold shadow">حدود {formatDecimal(request.distance)} کیلومتر از شما</div>
      </MapBg>
      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-canvas p-3 text-xs text-muted"><Icon name="lock" size="sm" />آدرس دقیق و امکان تماس با مشتری پس از قبول درخواست نمایش داده می‌شود.</div>
      <div className="mt-5 flex gap-2">
        <Button className="primary-button flex-1 justify-center" disabled={seconds === 0} onClick={accept}>قبول درخواست</Button>
        <Button className="secondary-button px-6" disabled={seconds === 0} onClick={reject}>رد</Button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Active job
// ─────────────────────────────────────────────

const jobStageLabel: Record<JobStage, string> = { accepted: "پذیرفته‌شده", enroute: "در مسیر", working: "در حال انجام", finished: "در انتظار پرداخت", paid: "پرداخت‌شده" };
const jobSteps: JobStage[] = ["accepted", "enroute", "working", "finished", "paid"];

function JobScreen({ job, setJob, finish, back }: { job: ActiveJob; setJob: (job: ActiveJob) => void; finish: () => void; back: () => void }) {
  const { toast } = useApp();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [labor, setLabor] = useState(job.quote?.labor ?? 650000);
  const [parts, setParts] = useState(job.quote?.parts ?? [{ name: "مکانیکال‌سیل", price: 320000 }]);
  const quoteTotal = job.quote ? job.quote.labor + job.quote.parts.reduce((sum, part) => sum + part.price, 0) : 0;
  const stepIndex = jobSteps.indexOf(job.stage);
  const set = (patch: Partial<ActiveJob>) => setJob({ ...job, ...patch });

  return (
    <>
      <div className="mb-5 flex items-center gap-3">
        <Button className="icon-action" onClick={back} label="بازگشت"><Icon name="back" /></Button>
        <div className="flex-1"><div className="text-lg font-black">کار فعال · {formatId(job.request.id)}</div><div className="text-xs text-muted">{job.request.service} {job.request.device}</div></div>
        <span className="status-pill bg-red-50 text-red-600">{jobStageLabel[job.stage]}</span>
      </div>

      <div className="order-track mb-4">
        {jobSteps.map((step, i) => <div key={step} className={`order-track-step ${i <= stepIndex ? "done" : ""}`}><span>{i <= stepIndex ? <Icon name="check" size="sm" /> : formatNumber(i + 1)}</span><div>{jobStageLabel[step]}</div></div>)}
      </div>

      <div className="surface-card">
        <div className="flex items-center gap-3"><span className="avatar avatar-2"><Icon name="user" /></span><div className="flex-1"><div className="font-black">{job.request.customer}</div><div className="text-xs text-muted">مشتری</div></div><Button className="icon-action" onClick={() => setCallOpen(true)} label="تماس با مشتری"><Icon name="phone" /></Button></div>
        <div className="mt-4 rounded-2xl bg-canvas p-3 text-sm leading-7"><div className="text-xs font-bold text-muted">آدرس دقیق</div>{job.request.exactAddress}</div>
        <Button className="secondary-button mt-3 w-full justify-center" onClick={() => toast("باز کردن مسیر در نشان / بلد")}><Icon name="route" />مسیریابی</Button>
      </div>

      <div className="surface-card mt-3">
        <div className="flex items-center justify-between"><div className="font-black">پیشنهاد قیمت</div>{job.quote && <span className={`status-pill ${job.quoteApproved ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{job.quoteApproved ? "تأیید مشتری" : "در انتظار تأیید مشتری"}</span>}</div>
        {job.quote ? (
          <>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">دستمزد</span><span className="font-bold">{formatPrice(job.quote.labor)}</span></div>
              {job.quote.parts.map((part) => <div key={part.name} className="flex justify-between"><span className="text-muted">{part.name}</span><span className="font-bold">{formatPrice(part.price)}</span></div>)}
              <div className="flex justify-between border-t border-line pt-2 font-black"><span>جمع</span><span>{formatPrice(quoteTotal)}</span></div>
              <div className="text-xs text-muted">کمیسیون حنیفی ({formatNumber(COMMISSION * 100)}٪ دستمزد): {formatPrice(Math.round(job.quote.labor * COMMISSION))} · دریافتی شما: {formatPrice(quoteTotal - Math.round(job.quote.labor * COMMISSION))}</div>
            </div>
            {!job.quoteApproved && (
              <div className="mt-4 flex gap-2">
                <Button className="secondary-button h-10 flex-1 justify-center text-sm" onClick={() => setQuoteOpen(true)}>ویرایش پیشنهاد</Button>
                <Button className="demo-chip" onClick={() => { set({ quoteApproved: true }); toast("مشتری پیشنهاد را تأیید کرد"); }}>پیش‌نمایش: تأیید مشتری</Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mt-2 text-sm text-muted">پس از بازدید، دستمزد و قطعات را برای تأیید مشتری بفرستید. بدون تأیید مشتری کار را شروع نکنید.</div>
            <Button className="primary-button mt-4 h-11 w-full justify-center" onClick={() => setQuoteOpen(true)}><Icon name="send" size="sm" />ارسال پیشنهاد قیمت</Button>
          </>
        )}
      </div>

      <div className="surface-card mt-3">
        <div className="font-black">وضعیت کار</div>
        {job.stage === "accepted" && <Button className="primary-button mt-4 w-full justify-center" onClick={() => { set({ stage: "enroute" }); toast("به مشتری اطلاع داده شد که در مسیر هستید"); }}><Icon name="route" />در مسیر هستم</Button>}
        {job.stage === "enroute" && (
          <>
            <Button className="primary-button mt-4 w-full justify-center" disabled={!job.quoteApproved} onClick={() => set({ stage: "working" })}><Icon name="tool" />رسیدم؛ شروع کار</Button>
            {!job.quoteApproved && <div className="mt-2 text-center text-xs text-muted">شروع کار پس از تأیید پیشنهاد قیمت توسط مشتری فعال می‌شود.</div>}
          </>
        )}
        {job.stage === "working" && (
          <>
            <div className="mt-3 text-sm text-muted">عکس بعد از انجام کار را بارگذاری کنید (حداقل یک عکس).</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from({ length: job.afterPhotos }, (_, i) => <span key={i} className="flex size-16 items-center justify-center rounded-xl bg-green-50 text-green-700"><Icon name="check" /></span>)}
              <Button className="flex size-16 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-xs font-bold text-muted" onClick={() => set({ afterPhotos: job.afterPhotos + 1 })}><Icon name="camera" />عکس</Button>
            </div>
            <Button className="primary-button mt-4 w-full justify-center" disabled={job.afterPhotos === 0} onClick={() => { set({ stage: "finished" }); toast("پایان کار ثبت شد؛ فاکتور برای مشتری ارسال شد"); }}><Icon name="check" />پایان کار</Button>
          </>
        )}
        {job.stage === "finished" && (
          <>
            <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">فاکتور {formatPrice(quoteTotal || job.request.estimate)} برای مشتری ارسال شد. پس از پرداخت آنلاین، کار بسته می‌شود.</div>
            <Button className="demo-chip mt-3" onClick={() => set({ stage: "paid" })}>پیش‌نمایش: مشتری پرداخت کرد</Button>
          </>
        )}
        {job.stage === "paid" && <Button className="primary-button mt-4 w-full justify-center" onClick={finish}>بستن کار و بازگشت</Button>}
      </div>

      <Modal open={quoteOpen} onClose={() => setQuoteOpen(false)} title="پیشنهاد قیمت" subtitle="این مبلغ برای تأیید به مشتری ارسال می‌شود.">
        <label className="form-label">دستمزد (تومان)<input className="form-field" inputMode="numeric" value={formatNumber(labor)} onChange={(event) => setLabor(Number(event.target.value.replace(/[^\d۰-۹]/g, "").replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))) || 0)} /></label>
        <div className="form-label">قطعات</div>
        <div className="mt-2 space-y-2">
          {parts.map((part, i) => (
            <div key={i} className="flex gap-2">
              <input className="form-field mt-0 flex-1" placeholder="نام قطعه" value={part.name} onChange={(event) => setParts(parts.map((p, j) => (j === i ? { ...p, name: event.target.value } : p)))} />
              <input className="form-field mt-0 w-32" inputMode="numeric" placeholder="مبلغ" value={formatNumber(part.price)} onChange={(event) => setParts(parts.map((p, j) => (j === i ? { ...p, price: Number(event.target.value.replace(/[^\d۰-۹]/g, "").replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))) || 0 } : p)))} />
              <Button className="icon-action" onClick={() => setParts(parts.filter((_, j) => j !== i))} label="حذف قطعه"><Icon name="trash" size="sm" /></Button>
            </div>
          ))}
          <Button className="text-link" onClick={() => setParts([...parts, { name: "", price: 0 }])}><Icon name="plus" size="sm" />افزودن قطعه</Button>
        </div>
        <div className="mt-5 flex justify-between rounded-2xl bg-canvas p-4 font-black"><span>جمع کل</span><span>{formatPrice(labor + parts.reduce((sum, part) => sum + part.price, 0))}</span></div>
        <Button className="primary-button mt-5 w-full justify-center" disabled={labor <= 0 || parts.some((part) => !part.name.trim())} onClick={() => { set({ quote: { labor, parts }, quoteApproved: false }); setQuoteOpen(false); toast("پیشنهاد برای مشتری ارسال شد"); }}><Icon name="send" size="sm" />ارسال برای مشتری</Button>
      </Modal>
      <Modal open={callOpen} onClose={() => setCallOpen(false)} title={`تماس با ${job.request.customer}`} subtitle="تماس از طریق شماره واسط برقرار می‌شود؛ شماره واقعی مشتری نمایش داده نمی‌شود.">
        <div className="mt-5 rounded-2xl bg-canvas p-5 text-center"><div className="text-2xl font-black tracking-wider" dir="ltr">۰۲۱ ۹۱۰۰ ۴۲۱۷</div><div className="mt-1 text-xs text-muted">کد داخلی: ۷۷۱۰</div></div>
        <a href="tel:02191004217" className="primary-button mt-5 justify-center"><Icon name="phone" />برقراری تماس</a>
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────
// Requests history
// ─────────────────────────────────────────────

function TechRequests({ job, history, openJob }: { job: ActiveJob | null; history: TechJob[]; openJob: () => void }) {
  const [tab, setTab] = useState<"active" | "done" | "rejected">(job ? "active" : "done");
  const done = history.filter((item) => item.status === "done");
  const rejected = history.filter((item) => item.status === "rejected");
  return (
    <>
      <div className="mb-5 text-xl font-black">درخواست‌های من</div>
      <Tabs value={tab} onChange={setTab} tabs={[{ key: "active", label: "فعال", count: job ? 1 : 0 }, { key: "done", label: "انجام‌شده", count: done.length }, { key: "rejected", label: "ردشده" }]} />
      <div className="mt-4 space-y-3">
        {tab === "active" && (job ? (
          <Button className="surface-card block w-full text-right" onClick={openJob}>
            <div className="flex justify-between"><span className="font-black">{job.request.service} {job.request.device}</span><span className="status-pill bg-red-50 text-red-600">{jobStageLabel[job.stage]}</span></div>
            <div className="mt-1 text-sm text-muted">{job.request.customer} · {job.request.area} · {job.request.time}</div>
          </Button>
        ) : <EmptyState icon="tool" text="کار فعالی ندارید" />)}
        {tab === "done" && done.map((item) => <HistoryRow key={item.id} item={item} />)}
        {tab === "rejected" && (rejected.length ? rejected.map((item) => <HistoryRow key={item.id} item={item} />) : <EmptyState icon="check" text="درخواست ردشده‌ای ندارید" />)}
      </div>
    </>
  );
}

function HistoryRow({ item }: { item: TechJob }) {
  return (
    <div className="surface-card">
      <div className="flex items-start justify-between gap-3"><div><div className="font-black">{item.service}</div><div className="mt-1 text-xs text-muted">{item.customer} · {item.area} · {item.date}</div></div><span className={`status-pill ${item.status === "done" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{item.status === "done" ? "انجام‌شده" : "ردشده"}</span></div>
      {item.status === "done" ? <div className="mt-3 text-sm"><span className="text-muted">مبلغ: </span><span className="font-black">{formatPrice(item.fee)}</span></div> : <div className="mt-3 text-xs text-muted">دلیل: {item.reason}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Earnings
// ─────────────────────────────────────────────

function Earnings({ history }: { history: TechJob[] }) {
  const { toast } = useApp();
  const done = history.filter((item) => item.status === "done");
  const gross = done.reduce((sum, item) => sum + item.fee, 0);
  const commission = done.reduce((sum, item) => sum + Math.round(item.fee * item.commissionRate), 0);
  const [editBank, setEditBank] = useState(false);
  const [sheba, setSheba] = useState("IR81017000000123456789012345");
  const [draft, setDraft] = useState(sheba);
  return (
    <>
      <div className="mb-5 text-xl font-black">درآمد و تسویه</div>
      <div className="status-panel">
        <div><div className="text-sm text-white/70">قابل تسویه (۱ تا ۱۵ مهر)</div><div className="mt-1 text-3xl font-black text-white">{formatPrice(gross - commission)}</div><div className="mt-1 text-xs text-white/70">تسویه خودکار: ۱۶ مهر به شبای ثبت‌شده</div></div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat icon="wallet" value={formatNumber(gross)} label="درآمد ناخالص" />
        <Stat icon="percent" value={formatNumber(commission)} label="کمیسیون حنیفی" />
        <Stat icon="check" value={formatNumber(done.length)} label="کار انجام‌شده" />
      </div>

      <div className="surface-card mt-5">
        <div className="mb-3 font-black">ریز کارها و کمیسیون</div>
        <div className="space-y-3">
          {done.map((item) => {
            const fee = Math.round(item.fee * item.commissionRate);
            return (
              <div key={item.id} className="flex items-center gap-3 border-b border-line pb-3 text-sm last:border-0 last:pb-0">
                <div className="min-w-0 flex-1"><div className="truncate font-bold">{item.service}</div><div className="text-xs text-muted">{item.date} · کمیسیون {formatNumber(item.commissionRate * 100)}٪ = {formatNumber(fee)}</div></div>
                <div className="text-left"><div className="font-black">{formatNumber(item.fee - fee)}</div><div className="text-xs text-faint line-through">{formatNumber(item.fee)}</div></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="surface-card mt-3">
        <div className="mb-3 font-black">تاریخچه تسویه</div>
        {settlements.map((item) => (
          <div key={item.id} className="flex items-center justify-between border-b border-line py-3 text-sm last:border-0">
            <div><div className="font-bold">{item.date}</div><div className="text-xs text-muted">پیگیری: {item.ref}</div></div>
            <div className="text-left"><div className="font-black">{formatPrice(item.amount)}</div><div className="text-xs font-bold text-success">{item.status}</div></div>
          </div>
        ))}
      </div>

      <div className="surface-card mt-3">
        <div className="flex items-center justify-between"><div className="font-black">حساب بانکی</div><Button className="text-xs font-bold text-brand" onClick={() => { setDraft(sheba); setEditBank(true); }}>ویرایش</Button></div>
        <div className="mt-3 rounded-2xl bg-canvas p-3 text-sm"><div className="text-xs text-muted">شماره شبا — {me.name}</div><div className="mt-1 font-black tracking-wider" dir="ltr">{sheba.slice(0, 6)} •••• •••• {sheba.slice(-4)}</div></div>
        <div className="mt-2 text-xs text-muted">تغییر شبا پس از تأیید مدیریت اعمال می‌شود.</div>
      </div>
      <Modal open={editBank} onClose={() => setEditBank(false)} title="ویرایش شماره شبا" subtitle="شبا باید به نام خود شما باشد.">
        <input className="form-field text-left tracking-wider" dir="ltr" value={draft} onChange={(event) => setDraft(event.target.value.toUpperCase())} />
        {draft && !isValidSheba(draft) && <div className="mt-2 text-xs font-bold text-red-600">شماره شبا معتبر نیست (IR و ۲۴ رقم)</div>}
        <Button className="primary-button mt-5 w-full justify-center" disabled={!isValidSheba(draft)} onClick={() => { setSheba(draft); setEditBank(false); toast("درخواست تغییر شبا برای بررسی ارسال شد"); }}>ارسال برای تأیید</Button>
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────

function TechProfile({ setAccount }: { setAccount: (state: AccountState) => void }) {
  const { toast } = useApp();
  const [tariffs, setTariffs] = useState(me.tariffs);
  const [areas, setAreas] = useState(["شمال تهران", "غرب تهران"]);
  const [editing, setEditing] = useState(false);
  const total = me.ratingBreakdown.reduce((a, b) => a + b, 0);
  return (
    <>
      <div className="mb-5 text-xl font-black">پروفایل من</div>
      <div className="surface-card">
        <div className="mb-3 text-xs font-bold text-muted">پیش‌نمایش پروفایل عمومی (آنچه مشتری می‌بیند)</div>
        <div className="flex items-center gap-3">
          <span className="avatar avatar-1 size-16"><Icon name="user" size="lg" /></span>
          <div className="flex-1"><div className="flex items-center gap-2 font-black">{me.name}<span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700"><Icon name="shield" size="sm" />تأییدشده</span></div><div className="mt-1 text-xs text-muted">{me.skill} · {me.city}</div></div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {[[formatDecimal(me.rating), "امتیاز"], [formatNumber(me.jobs), "پروژه"], [`${formatNumber(me.acceptance)}٪`, "پذیرش"], [`${formatNumber(me.experience)} سال`, "سابقه"]].map(([v, l]) => <div key={l} className="rounded-xl bg-canvas p-2"><div className="font-black">{v}</div><div className="text-xs text-muted">{l}</div></div>)}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">{me.specialties.map((item) => <span key={item} className="rounded-lg bg-canvas px-2 py-1 text-xs font-bold">{item}</span>)}</div>
      </div>

      <div className="surface-card mt-3">
        <div className="mb-3 flex items-center justify-between"><div className="font-black">تعرفه‌ها</div><Button className="text-xs font-bold text-brand" onClick={() => { if (editing) toast("تعرفه‌ها ذخیره شد"); setEditing(!editing); }}>{editing ? "ذخیره" : "ویرایش"}</Button></div>
        {tariffs.map((item, i) => (
          <div key={item.label} className="flex items-center justify-between gap-3 border-b border-line py-3 text-sm last:border-0">
            <span className="text-muted">{item.label}</span>
            {editing ? <input className="form-field mt-0 w-36 py-2 text-left" inputMode="numeric" value={formatNumber(item.price)} onChange={(event) => setTariffs(tariffs.map((t, j) => (j === i ? { ...t, price: Number(event.target.value.replace(/[^\d۰-۹]/g, "").replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))) || 0 } : t)))} /> : <span className="font-bold">{formatPrice(item.price)}</span>}
          </div>
        ))}
      </div>

      <div className="surface-card mt-3">
        <div className="mb-3 font-black">محدوده فعالیت</div>
        <div className="flex flex-wrap gap-2">{tehranAreas.map((area) => <Button key={area} className={`filter-chip px-3 text-xs ${areas.includes(area) ? "filter-chip-active" : ""}`} onClick={() => setAreas(areas.includes(area) ? areas.filter((a) => a !== area) : [...areas, area])}>{area}</Button>)}</div>
      </div>

      <div className="surface-card mt-3">
        <div className="mb-3 font-black">امتیاز و نظرات</div>
        {[5, 4, 3, 2, 1].map((star, i) => (
          <div key={star} className="mb-2 flex items-center gap-3 text-xs"><span className="w-6 font-bold text-amber-600">★{formatNumber(star)}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas"><div className="h-full rounded-full bg-amber-400" style={{ width: `${(me.ratingBreakdown[i] / total) * 100}%` }} /></div><span className="w-8 text-muted">{formatNumber(me.ratingBreakdown[i])}</span></div>
        ))}
        <div className="mt-4 space-y-3">{me.techReviews.map((review) => <div key={review.author} className="rounded-2xl bg-canvas p-3 text-sm"><div className="flex justify-between font-bold">{review.author}<span className="text-amber-600">{"★".repeat(review.rating)}</span></div><div className="mt-1 leading-7 text-muted">{review.text}</div></div>)}</div>
      </div>

      <div className="surface-card mt-3">
        <div className="mb-3 font-black">مدارک</div>
        {["کارت ملی و عکس شخص", "گواهی فنی‌وحرفه‌ای", "اطلاعات بانکی"].map((item) => <div className="menu-row" key={item}><span>{item}</span><span className="flex items-center gap-1 text-xs font-bold text-success"><Icon name="check" size="sm" />تأییدشده</span></div>)}
      </div>

      <div className="demo-bar mt-5">
        <span className="font-black">پیش‌نمایش وضعیت حساب:</span>
        <Button className="demo-chip" onClick={() => setAccount("onboarding")}>ثبت‌نام نصاب جدید</Button>
        <Button className="demo-chip" onClick={() => setAccount("pending")}>در انتظار بررسی</Button>
        <Button className="demo-chip" onClick={() => setAccount("rejected")}>ردشده</Button>
        <Button className="demo-chip" onClick={() => setAccount("suspended")}>تعلیق</Button>
        <Button className="demo-chip" onClick={() => setAccount("blocked")}>مسدود</Button>
      </div>
    </>
  );
}

function TechNotificationsList({ back }: { back: () => void }) {
  return (
    <>
      <div className="mb-5 flex items-center gap-3"><Button className="icon-action" onClick={back} label="بازگشت"><Icon name="back" /></Button><div className="text-xl font-black">اعلان‌ها</div></div>
      <div className="space-y-3">
        {techNotifications.map((item) => (
          <div key={item.id} className={`notification-row ${item.unread ? "notification-unread" : ""}`}>
            <span className="stat-icon shrink-0"><Icon name={item.icon} /></span>
            <span className="flex-1"><span className="flex items-center gap-2 font-black">{item.title}{item.unread && <span className="size-2 rounded-full bg-accent" />}</span><span className="mt-1 block text-sm text-muted">{item.text}</span><span className="mt-2 block text-xs text-faint">{item.time}</span></span>
          </div>
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Onboarding: signup → profile → KYC → admin review → activation
// ─────────────────────────────────────────────

const stages = ["ثبت‌نام اولیه", "تکمیل پروفایل", "احراز هویت", "تأیید مدیریت", "فعال‌سازی"];

function Onboarding({ state, setState }: { state: AccountState; setState: (state: AccountState) => void }) {
  const { toast } = useApp();
  const [step, setStep] = useState(state === "rejected" ? 2 : state === "onboarding" ? 0 : 3);
  const [name, setName] = useState("");
  const [profile, setProfile] = useState({ city: "تهران", areas: [] as string[], specialties: [] as string[], experience: "", history: "", tariffs: {} as Record<string, string> });
  const [uploads, setUploads] = useState<Record<string, { state: UploadState; preview?: string }>>((): Record<string, { state: UploadState; preview?: string }> =>
    state === "rejected"
      ? { photo: { state: "uploaded" }, cardFront: { state: "uploaded" }, cardBack: { state: "uploaded" }, selfie: { state: "rejected" }, cert: { state: "uploaded" } }
      : {},
  );
  const [certs, setCerts] = useState<string[]>(state === "rejected" ? ["گواهی مهارت برق صنعتی.pdf"] : []);
  const [nationalCode, setNationalCode] = useState(state === "rejected" ? "0123456789" : "");
  const [sheba, setSheba] = useState(state === "rejected" ? "IR81017000000123456789012345" : "");
  const [holder, setHolder] = useState("");

  const upload = (key: string) => (file: File) => {
    const preview = file.type.startsWith("image") ? URL.createObjectURL(file) : undefined;
    setUploads((prev) => ({ ...prev, [key]: { state: "uploading", preview } }));
    window.setTimeout(() => setUploads((prev) => ({ ...prev, [key]: { state: "uploaded", preview } })), 1200);
  };
  const tile = (key: string, label: string, hint?: string) => (
    <UploadTile key={key} label={label} hint={hint} state={uploads[key]?.state ?? "empty"} preview={uploads[key]?.preview} rejectReason="چهره در تصویر واضح نیست؛ در نور کافی و بدون عینک دوباره بگیرید"
      onPick={upload(key)} onRemove={() => setUploads((prev) => ({ ...prev, [key]: { state: "empty" } }))} />
  );
  const done = (key: string) => uploads[key]?.state === "uploaded";
  const profileValid = profile.areas.length > 0 && profile.specialties.length > 0 && Number(profile.experience) >= 0 && profile.experience !== "" && done("photo");
  const kycValid = isValidNationalCode(nationalCode) && done("cardFront") && done("cardBack") && done("selfie") && (done("cert") || certs.length > 0) && isValidSheba(sheba) && holder.trim().length > 2;

  const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  const stageIndex = state === "pending" ? 3 : state === "approved" ? 4 : step;

  const progress = (
    <div className="mb-6">
      <div className="flex gap-1">{stages.map((label, i) => <div key={label} className={`h-1.5 flex-1 rounded-full ${i <= stageIndex ? "bg-brand" : "bg-line"}`} />)}</div>
      <div className="mt-3 flex justify-between text-[11px] font-bold text-muted">{stages.map((label, i) => <span key={label} className={`${i === stageIndex ? "text-brand" : ""} ${i === stageIndex ? "" : "hidden sm:inline"}`}>{formatNumber(i + 1)}. {label}</span>)}</div>
    </div>
  );

  // Terminal account states
  if (state === "pending" || state === "suspended" || state === "blocked") {
    const view = {
      pending: { icon: "clock" as IconName, tone: "bg-amber-50 text-amber-600", title: "مدارک شما در حال بررسی است", text: "کارشناسان حنیفی مدارک را بررسی می‌کنند. معمولاً ۲۴ تا ۴۸ ساعت کاری طول می‌کشد و نتیجه با پیامک اطلاع داده می‌شود." },
      suspended: { icon: "pause" as IconName, tone: "bg-amber-50 text-amber-600", title: "حساب شما موقتاً تعلیق شده است", text: "به دلیل ۳ گزارش تأخیر در هفته گذشته، دریافت درخواست تا ۱۲ مهر ۱۴۰۵ غیرفعال است. برای اعتراض با پشتیبانی نصاب‌ها تماس بگیرید." },
      blocked: { icon: "ban" as IconName, tone: "bg-red-50 text-red-600", title: "حساب شما مسدود شده است", text: "به دلیل نقض قوانین (دریافت وجه خارج از اپ)، امکان فعالیت در حنیفی وجود ندارد. در صورت اعتراض، درخواست بررسی مجدد ثبت کنید." },
    }[state];
    return (
      <div className="min-h-screen bg-canvas text-ink">
        <main className="tech-wrap py-8">
          {state === "pending" && progress}
          <div className="surface-card text-center">
            <span className={`mx-auto flex size-20 items-center justify-center rounded-full ${view.tone}`}><Icon name={view.icon} size="lg" /></span>
            <div className="mt-4 text-xl font-black">{view.title}</div>
            <div className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">{view.text}</div>
            {state === "pending" && (
              <div className="mx-auto mt-5 max-w-sm space-y-2 text-right text-sm">
                {["تصویر کارت ملی", "عکس شخص", "گواهی فنی", "اطلاعات بانکی"].map((doc) => <div key={doc} className="flex justify-between rounded-xl bg-canvas p-3"><span>{doc}</span><span className="text-xs font-bold text-amber-700">در انتظار بررسی</span></div>)}
              </div>
            )}
            <a href="tel:02144228100" className="secondary-button mx-auto mt-6 w-fit"><Icon name="phone" />پشتیبانی نصاب‌ها</a>
          </div>
          <div className="demo-bar mt-5">
            <span className="font-black">پیش‌نمایش نتیجه:</span>
            <Button className="demo-chip" onClick={() => { setState("approved"); toast("حساب شما فعال شد"); }}>تأیید و فعال‌سازی</Button>
            <Button className="demo-chip" onClick={() => setState("rejected")}>رد مدرک</Button>
            {state !== "pending" && <Button className="demo-chip" onClick={() => setState("pending")}>در انتظار بررسی</Button>}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line bg-white"><div className="tech-wrap flex h-16 items-center gap-3"><span className="brand-mark size-10"><Icon name="tool" /></span><div className="font-black">ثبت‌نام نصاب حنیفی</div></div></header>
      <main className="tech-wrap py-6 pb-28">
        {progress}

        {state === "rejected" && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="font-black">یکی از مدارک شما رد شد</div>
            <div className="mt-1">«عکس شخص» را اصلاح و دوباره ارسال کنید. بقیه مدارک تأیید شده‌اند.</div>
          </div>
        )}

        {step === 0 && (
          <div className="surface-card">
            <div className="text-xl font-black">به شبکه نصاب‌های حنیفی بپیوندید</div>
            <div className="mt-2 text-sm leading-7 text-muted">درخواست‌های نصب و تعمیر محدوده خود را مستقیم دریافت کنید. ثبت‌نام رایگان است و فعالیت پس از احراز هویت و تأیید مدیریت آغاز می‌شود.</div>
            <LoginFlow compact onDone={(u) => { setName(u.name); setHolder(u.name); setStep(1); }} />
          </div>
        )}

        {step === 1 && (
          <div className="surface-card">
            <div className="text-xl font-black">تکمیل پروفایل</div>
            <div className="mt-1 text-sm text-muted">این اطلاعات در پروفایل عمومی شما به مشتریان نمایش داده می‌شود.</div>
            <div className="mt-5">{tile("photo", "عکس پروفایل", "عکس واضح از چهره، پس‌زمینه ساده")}</div>
            <label className="form-label">نام و نام خانوادگی<input className="form-field" value={name} onChange={(event) => setName(event.target.value)} /></label>
            <label className="form-label">شهر
              <select className="form-field" value={profile.city} onChange={(event) => setProfile({ ...profile, city: event.target.value })}>{["تهران", "کرج", "اصفهان", "شیراز"].map((city) => <option key={city}>{city}</option>)}</select>
            </label>
            <div className="form-label">محدوده فعالیت</div>
            <MapBg className="mt-2 h-36">
              {profile.areas.map((area, i) => <div key={area} className="tech-zone tech-zone-online" style={{ left: `${20 + ((i * 23) % 60)}%`, top: `${30 + ((i * 17) % 45)}%`, width: 70, height: 70 }}><span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black shadow">{area}</span></div>)}
            </MapBg>
            <div className="mt-3 flex flex-wrap gap-2">{tehranAreas.map((area) => <Button key={area} className={`filter-chip px-3 text-xs ${profile.areas.includes(area) ? "filter-chip-active" : ""}`} onClick={() => setProfile({ ...profile, areas: toggle(profile.areas, area) })}>{area}</Button>)}</div>
            <div className="form-label">تخصص‌ها</div>
            <div className="mt-2 flex flex-wrap gap-2">{specialtyOptions.map((item) => <Button key={item} className={`filter-chip px-3 text-xs ${profile.specialties.includes(item) ? "filter-chip-active" : ""}`} onClick={() => setProfile({ ...profile, specialties: toggle(profile.specialties, item) })}>{item}</Button>)}</div>
            <label className="form-label">سابقه کار (سال)<input className="form-field" inputMode="numeric" value={profile.experience} onChange={(event) => setProfile({ ...profile, experience: event.target.value.replace(/[^\d۰-۹]/g, "").replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))) })} /></label>
            <label className="form-label">سوابق کاری<textarea className="form-field min-h-24 resize-none" placeholder="مثال: ۸ سال سرویس بوستر پمپ مجتمع‌های مسکونی..." value={profile.history} onChange={(event) => setProfile({ ...profile, history: event.target.value })} /></label>
            {profile.specialties.length > 0 && (
              <>
                <div className="form-label">تعرفه پایه هر خدمت (تومان)</div>
                <div className="mt-2 space-y-2">{profile.specialties.map((item) => <div key={item} className="flex items-center gap-3 text-sm"><span className="flex-1 text-muted">{item}</span><input className="form-field mt-0 w-36 py-2 text-left" inputMode="numeric" placeholder="۵۰۰٬۰۰۰" value={profile.tariffs[item] ?? ""} onChange={(event) => setProfile({ ...profile, tariffs: { ...profile.tariffs, [item]: event.target.value } })} /></div>)}</div>
              </>
            )}
            <Button className="primary-button mt-6 w-full justify-center" disabled={!profileValid} onClick={() => setStep(2)}>ادامه: احراز هویت</Button>
            {!profileValid && <div className="mt-2 text-center text-xs text-muted">عکس، محدوده، تخصص و سابقه الزامی است.</div>}
          </div>
        )}

        {step === 2 && (
          <div className="surface-card">
            <div className="text-xl font-black">احراز هویت</div>
            <div className="mt-1 text-sm text-muted">مدارک فقط برای بررسی هویت استفاده و به صورت رمزنگاری‌شده نگهداری می‌شوند.</div>
            <label className="form-label">کد ملی
              <input className="form-field text-left tracking-widest" dir="ltr" inputMode="numeric" maxLength={10} value={nationalCode} onChange={(event) => setNationalCode(event.target.value)} />
            </label>
            {nationalCode.length >= 10 && !isValidNationalCode(nationalCode) && <div className="mt-2 text-xs font-bold text-red-600">کد ملی معتبر نیست</div>}
            <div className="mt-5 space-y-3">
              {tile("cardFront", "تصویر روی کارت ملی")}
              {tile("cardBack", "تصویر پشت کارت ملی")}
              {tile("selfie", "عکس شخص (سلفی با کارت ملی)", "کارت ملی را کنار صورت بگیرید")}
              {tile("cert", "مدارک فنی (گواهی فنی‌وحرفه‌ای، سابقه کار)", "PDF یا تصویر؛ می‌توانید چند فایل اضافه کنید")}
              {certs.map((file) => <div key={file} className="flex items-center gap-2 rounded-xl bg-canvas px-3 py-2 text-xs"><Icon name="file" size="sm" />{file}<Button className="mr-auto text-red-600" onClick={() => setCerts(certs.filter((c) => c !== file))} label="حذف"><Icon name="close" size="sm" /></Button></div>)}
              {done("cert") && <Button className="text-link" onClick={() => { setCerts([...certs, `مدرک فنی ${formatNumber(certs.length + 2)}.pdf`]); }}><Icon name="plus" size="sm" />افزودن مدرک دیگر</Button>}
            </div>
            <div className="mt-6 font-black">اطلاعات بانکی (برای تسویه)</div>
            <label className="form-label">شماره شبا<input className="form-field text-left tracking-wider" dir="ltr" placeholder="IR00 0000 0000 0000 0000 0000 00" value={sheba} onChange={(event) => setSheba(event.target.value.toUpperCase())} /></label>
            {sheba.length > 5 && !isValidSheba(sheba) && <div className="mt-2 text-xs font-bold text-red-600">شماره شبا معتبر نیست</div>}
            <label className="form-label">نام صاحب حساب<input className="form-field" value={holder} onChange={(event) => setHolder(event.target.value)} /></label>
            <div className="mt-2 text-xs text-muted">حساب باید به نام خود شما باشد.</div>
            <div className="mt-6 flex gap-2">
              {state !== "rejected" && <Button className="secondary-button px-5" onClick={() => setStep(1)}>قبلی</Button>}
              <Button className="primary-button flex-1 justify-center" disabled={!kycValid} onClick={() => { setState("pending"); toast("مدارک برای بررسی ارسال شد"); }}>ارسال برای بررسی</Button>
            </div>
            <div className="mt-3 text-center text-xs text-faint">برای پیش‌نمایش: کد ملی 0123456789 و شبای IR81017000000123456789012345 معتبرند.</div>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  return <div className="stat-card"><span className="stat-icon"><Icon name={icon} /></span><div className="mt-3 truncate text-lg font-black">{value}</div><div className="mt-1 text-xs text-muted">{label}</div></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-canvas p-3"><div className="text-xs text-muted">{label}</div><div className="mt-1 font-bold">{value}</div></div>;
}

