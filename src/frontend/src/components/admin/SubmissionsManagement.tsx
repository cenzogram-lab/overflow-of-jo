import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Calendar,
  Inbox,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Star,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { useActor } from "../../hooks/useActor";
import type { Inquiry, PrayerRequest } from "../../types";

type Tab = "booking" | "prayer";

interface DeleteTarget {
  type: "inquiry" | "prayer";
  id: bigint;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return dateStr;
}

function formatTimestamp(ns: bigint): string {
  try {
    const ms = Number(ns / 1_000_000n);
    return new Date(ms).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatEventType(et: string): string {
  switch (et) {
    case "Wedding":
      return "Wedding";
    case "ChurchEvent":
      return "Church Event";
    case "CommunityGathering":
      return "Community Gathering";
    default:
      return et;
  }
}

export default function SubmissionsManagement() {
  const [activeTab, setActiveTab] = useState<Tab>("booking");
  const [showStarredBooking, setShowStarredBooking] = useState(false);
  const [showStarredPrayer, setShowStarredPrayer] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStarring, setIsStarring] = useState<bigint | null>(null);
  const { actor } = useActor();

  const {
    data: inquiries,
    isLoading: loadingInquiries,
    isError: errorInquiries,
    refetch: refetchInquiries,
    isFetching: fetchingInquiries,
  } = useQuery<Inquiry[]>({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).getAllInquiries();
    },
    enabled: !!actor,
    staleTime: 30_000,
  });

  const {
    data: prayers,
    isLoading: loadingPrayers,
    isError: errorPrayers,
    refetch: refetchPrayers,
    isFetching: fetchingPrayers,
  } = useQuery<PrayerRequest[]>({
    queryKey: ["admin-prayer-requests"],
    queryFn: async () => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).getAllPrayerRequests();
    },
    enabled: !!actor,
    staleTime: 30_000,
  });

  const sortedInquiries = inquiries
    ? [...inquiries].sort((a, b) => Number(b.id - a.id))
    : [];
  const sortedPrayers = prayers
    ? [...prayers].sort((a, b) => Number(b.submittedAt - a.submittedAt))
    : [];

  const filteredInquiries = showStarredBooking
    ? sortedInquiries.filter((i) => i.starred)
    : sortedInquiries;
  const filteredPrayers = showStarredPrayer
    ? sortedPrayers.filter((p) => p.starred)
    : sortedPrayers;

  async function handleStarInquiry(id: bigint) {
    if (!actor || isStarring !== null) return;
    setIsStarring(id);
    try {
      await (actor as any).starInquiry(id);
      await refetchInquiries();
    } finally {
      setIsStarring(null);
    }
  }

  async function handleStarPrayer(id: bigint) {
    if (!actor || isStarring !== null) return;
    setIsStarring(id);
    try {
      await (actor as any).starPrayerRequest(id);
      await refetchPrayers();
    } finally {
      setIsStarring(null);
    }
  }

  async function handleConfirmDelete() {
    if (!actor || !deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === "inquiry") {
        await (actor as any).deleteInquiry(deleteTarget.id);
        await refetchInquiries();
      } else {
        await (actor as any).deletePrayerRequest(deleteTarget.id);
        await refetchPrayers();
      }
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-admin-text font-display">
          Form Submissions
        </h1>
        <p className="text-admin-muted text-sm mt-1">
          View all submitted booking inquiries and prayer requests.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-admin-input rounded-lg p-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("booking")}
          data-ocid="submissions.booking.tab"
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
            activeTab === "booking"
              ? "bg-admin-card text-admin-accent border border-admin-accent/30 shadow-sm"
              : "text-admin-muted hover:text-admin-text"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Booking Inquiries
          {sortedInquiries.length > 0 && (
            <span className="ml-1 bg-admin-accent/20 text-admin-accent text-xs font-semibold rounded-full px-1.5 py-0.5">
              {sortedInquiries.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("prayer")}
          data-ocid="submissions.prayer.tab"
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
            activeTab === "prayer"
              ? "bg-admin-card text-admin-accent border border-admin-accent/30 shadow-sm"
              : "text-admin-muted hover:text-admin-text"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Prayer Requests
          {sortedPrayers.length > 0 && (
            <span className="ml-1 bg-admin-accent/20 text-admin-accent text-xs font-semibold rounded-full px-1.5 py-0.5">
              {sortedPrayers.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Booking Inquiries Tab ── */}
      {activeTab === "booking" && (
        <div>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <p className="text-admin-muted text-sm">
                {loadingInquiries
                  ? "Loading…"
                  : `${filteredInquiries.length} submission${filteredInquiries.length !== 1 ? "s" : ""}`}
              </p>
              {/* Starred filter toggle */}
              <button
                type="button"
                onClick={() => setShowStarredBooking((v) => !v)}
                data-ocid="submissions.booking.starred.toggle"
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all duration-150 ${
                  showStarredBooking
                    ? "bg-admin-accent/20 text-admin-accent border-admin-accent/40"
                    : "text-admin-muted border-admin-border hover:text-admin-text hover:border-admin-border"
                }`}
              >
                <Star
                  className="w-3 h-3"
                  fill={showStarredBooking ? "currentColor" : "none"}
                />
                {showStarredBooking ? "Starred" : "All"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => refetchInquiries()}
              disabled={fetchingInquiries}
              data-ocid="submissions.booking.button"
              className="flex items-center gap-1.5 text-xs text-admin-muted hover:text-admin-text transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${fetchingInquiries ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {loadingInquiries ? (
            <div
              className="flex items-center justify-center py-16 text-admin-muted"
              data-ocid="submissions.booking.loading_state"
            >
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading inquiries…
            </div>
          ) : errorInquiries ? (
            <div
              className="py-12 text-center text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg"
              data-ocid="submissions.booking.error_state"
            >
              Failed to load inquiries. Make sure you are logged in as admin.
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div
              className="py-16 text-center text-admin-muted border border-admin-border rounded-lg bg-admin-input/30"
              data-ocid="submissions.booking.empty_state"
            >
              <Inbox className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                {showStarredBooking
                  ? "No starred booking inquiries."
                  : "No booking inquiries yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4" data-ocid="submissions.booking.list">
              {filteredInquiries.map((inq, index) => (
                <div
                  key={String(inq.id)}
                  data-ocid={`submissions.booking.item.${index + 1}`}
                  className="bg-admin-card border border-admin-border rounded-lg p-5 space-y-3"
                >
                  {/* Top row: name + event type badge + actions */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-admin-accent/15 border border-admin-accent/30 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-admin-accent" />
                      </div>
                      <div>
                        <p className="text-admin-text font-semibold text-sm leading-tight">
                          {inq.name || "—"}
                        </p>
                        <p className="text-admin-muted text-xs">
                          #{String(inq.id)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-medium bg-admin-accent/15 text-admin-accent border border-admin-accent/25 rounded-full px-2.5 py-0.5">
                        {formatEventType(String(inq.eventType))}
                      </span>
                      {/* Star button */}
                      <button
                        type="button"
                        onClick={() => handleStarInquiry(inq.id)}
                        disabled={isStarring === inq.id}
                        aria-label={
                          inq.starred ? "Unstar submission" : "Star submission"
                        }
                        data-ocid={`submissions.booking.star.${index + 1}`}
                        className={`p-1.5 rounded-md transition-all duration-150 disabled:opacity-50 ${
                          inq.starred
                            ? "text-admin-accent hover:text-admin-accent/70"
                            : "text-admin-muted hover:text-admin-accent"
                        }`}
                      >
                        <Star
                          className="w-4 h-4"
                          fill={inq.starred ? "currentColor" : "none"}
                        />
                      </button>
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({ type: "inquiry", id: inq.id })
                        }
                        aria-label="Delete submission"
                        data-ocid={`submissions.booking.delete_button.${index + 1}`}
                        className="p-1.5 rounded-md text-admin-muted hover:text-red-400 transition-all duration-150"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-admin-muted">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{inq.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-admin-muted">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{inq.phone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-admin-muted">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>Event Date: {formatDate(inq.eventDate)}</span>
                    </div>
                  </div>

                  {/* Message */}
                  {inq.message && (
                    <div className="bg-admin-input rounded-md px-4 py-3 text-sm text-admin-text leading-relaxed border border-admin-border">
                      {inq.message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Prayer Requests Tab ── */}
      {activeTab === "prayer" && (
        <div>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <p className="text-admin-muted text-sm">
                {loadingPrayers
                  ? "Loading…"
                  : `${filteredPrayers.length} submission${filteredPrayers.length !== 1 ? "s" : ""}`}
              </p>
              {/* Starred filter toggle */}
              <button
                type="button"
                onClick={() => setShowStarredPrayer((v) => !v)}
                data-ocid="submissions.prayer.starred.toggle"
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all duration-150 ${
                  showStarredPrayer
                    ? "bg-admin-accent/20 text-admin-accent border-admin-accent/40"
                    : "text-admin-muted border-admin-border hover:text-admin-text hover:border-admin-border"
                }`}
              >
                <Star
                  className="w-3 h-3"
                  fill={showStarredPrayer ? "currentColor" : "none"}
                />
                {showStarredPrayer ? "Starred" : "All"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => refetchPrayers()}
              disabled={fetchingPrayers}
              data-ocid="submissions.prayer.button"
              className="flex items-center gap-1.5 text-xs text-admin-muted hover:text-admin-text transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${fetchingPrayers ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {loadingPrayers ? (
            <div
              className="flex items-center justify-center py-16 text-admin-muted"
              data-ocid="submissions.prayer.loading_state"
            >
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading prayer requests…
            </div>
          ) : errorPrayers ? (
            <div
              className="py-12 text-center text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg"
              data-ocid="submissions.prayer.error_state"
            >
              Failed to load prayer requests. Make sure you are logged in as
              admin.
            </div>
          ) : filteredPrayers.length === 0 ? (
            <div
              className="py-16 text-center text-admin-muted border border-admin-border rounded-lg bg-admin-input/30"
              data-ocid="submissions.prayer.empty_state"
            >
              <Inbox className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                {showStarredPrayer
                  ? "No starred prayer requests."
                  : "No prayer requests yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4" data-ocid="submissions.prayer.list">
              {filteredPrayers.map((pr, index) => (
                <div
                  key={String(pr.id)}
                  data-ocid={`submissions.prayer.item.${index + 1}`}
                  className="bg-admin-card border border-admin-border rounded-lg p-5 space-y-3"
                >
                  {/* Top row: name + sleeve badge + actions */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-admin-accent/15 border border-admin-accent/30 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-admin-accent" />
                      </div>
                      <div>
                        <p className="text-admin-text font-semibold text-sm leading-tight">
                          {pr.firstName ? pr.firstName : "Anonymous"}
                        </p>
                        <p className="text-admin-muted text-xs">
                          {formatTimestamp(pr.submittedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      {pr.allowOnSleeve && (
                        <span className="text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/25 rounded-full px-2.5 py-0.5">
                          OK for sleeve
                        </span>
                      )}
                      {/* Star button */}
                      <button
                        type="button"
                        onClick={() => handleStarPrayer(pr.id)}
                        disabled={isStarring === pr.id}
                        aria-label={
                          pr.starred ? "Unstar request" : "Star request"
                        }
                        data-ocid={`submissions.prayer.star.${index + 1}`}
                        className={`p-1.5 rounded-md transition-all duration-150 disabled:opacity-50 ${
                          pr.starred
                            ? "text-admin-accent hover:text-admin-accent/70"
                            : "text-admin-muted hover:text-admin-accent"
                        }`}
                      >
                        <Star
                          className="w-4 h-4"
                          fill={pr.starred ? "currentColor" : "none"}
                        />
                      </button>
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({ type: "prayer", id: pr.id })
                        }
                        aria-label="Delete request"
                        data-ocid={`submissions.prayer.delete_button.${index + 1}`}
                        className="p-1.5 rounded-md text-admin-muted hover:text-red-400 transition-all duration-150"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Prayer request text */}
                  <div className="bg-admin-input rounded-md px-4 py-3 text-sm text-admin-text leading-relaxed border border-admin-border">
                    {pr.request || "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          data-ocid="submissions.delete.dialog"
        >
          {/* Backdrop */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isDeleting && setDeleteTarget(null)}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !isDeleting)
                setDeleteTarget(null);
            }}
          />
          {/* Modal */}
          <div className="relative bg-admin-card border border-admin-border rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-admin-text font-semibold text-base leading-tight">
                  Delete Submission
                </h3>
                <p className="text-admin-muted text-xs mt-0.5">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-admin-muted text-sm leading-relaxed">
              Are you sure you want to delete this submission? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                data-ocid="submissions.delete.cancel_button"
                className="flex-1 px-4 py-2 rounded-lg border border-admin-border text-admin-muted hover:text-admin-text hover:border-admin-text/30 text-sm font-medium transition-all duration-150 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                data-ocid="submissions.delete.confirm_button"
                className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
