import MarketingNav    from '../../components/marketing/MarketingNav'
import MarketingFooter from '../../components/marketing/MarketingFooter'

const LAST_UPDATED = '28 April 2026'

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">{title}</h2>
      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  )
}

export default function Privacy() {
  return (
    <>
      <MarketingNav />

      <main className="bg-slate-50 min-h-screen">
        {/* Hero */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-6 py-16">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">Legal</p>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Privacy Policy</h1>
            <p className="text-slate-500">Last updated: {LAST_UPDATED}</p>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-3xl mx-auto px-6 py-12">

          <Section title="Who we are">
            <p>
              CalCheq is operated by Calcheq Pty Ltd (ABN 19 731 880 044), an Australian company
              providing calibration management software to industrial and process facilities.
              When this policy says <em>“we”, “us”,</em> or <em>“CalCheq”</em>, that's who it means.
            </p>
            <p>
              We comply with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth)
              and, where applicable, the EU General Data Protection Regulation (GDPR).
            </p>
          </Section>

          <Section title="What we collect">
            <p>The data we hold falls into four categories:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account information</strong> — name, email address, password hash, role within
                your site, and the company / site name you registered. Provided directly by you when
                you sign up or are invited to a site.
              </li>
              <li>
                <strong>Calibration records</strong> — instrument tags, test points, as-found / as-left
                readings, technician notes, photos of instruments and tag plates. Created by you and
                your colleagues as you use the app.
              </li>
              <li>
                <strong>Billing information</strong> — handled by Stripe; we never see your card
                number. We retain only your Stripe customer ID, subscription status, and invoice
                history sufficient to operate the service.
              </li>
              <li>
                <strong>Technical data</strong> — IP address, browser / device type, and timestamps
                of your requests. Used for security, abuse prevention, and debugging.
              </li>
            </ul>
          </Section>

          <Section title="Why we collect it">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>To run the service.</strong> Calibration records are the product — without them, there's nothing to manage.</li>
              <li><strong>To authenticate you.</strong> Email + password sign-in via Supabase Auth.</li>
              <li><strong>To communicate with you.</strong> Calibration certificates, approval notifications, due-date reminders, and occasional product updates.</li>
              <li><strong>To bill you.</strong> Stripe processes payment; we record subscription status to gate access.</li>
              <li><strong>To keep the service secure.</strong> Logs and IP-level rate limits help us spot abuse.</li>
            </ul>
            <p>We do <strong>not</strong> sell your data, and we do not use your calibration records for advertising, profiling, or training third-party AI models.</p>
          </Section>

          <Section title="Where it lives">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Database & file storage:</strong> Supabase (PostgreSQL + S3-compatible object storage), region-locked to Sydney (ap-southeast-2).</li>
              <li><strong>Application hosting:</strong> Railway (US-East). Application servers process requests in transit but do not persist customer data.</li>
              <li><strong>Email delivery:</strong> Resend, for transactional emails (cert delivery, approval notifications, password resets).</li>
              <li><strong>Payments:</strong> Stripe — handles all card data and PCI scope on our behalf.</li>
            </ul>
            <p>All data in transit is encrypted with TLS 1.2 or above. Database backups are encrypted at rest.</p>
          </Section>

          <Section title="Photos and the camera">
            <p>
              The mobile app uses your device's camera for two purposes: scanning instrument tags
              (the image is processed locally and discarded) and capturing photos that you choose to
              attach to a calibration record. Captured photos upload to your site's private storage
              bucket and are visible only to authenticated members of your CalCheq site. We never
              share, sell, or analyse photo content.
            </p>
            <p>You can delete a photo from a calibration record at any time, or contact us to remove all photos for a given site.</p>
          </Section>

          <Section title="Sharing">
            <p>We share data only in these specific cases:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>With other members of your site.</strong> Calibration records, instruments,
                and photos are visible to everyone you've invited to your CalCheq site. Members of
                other sites cannot see your data.
              </li>
              <li>
                <strong>With our infrastructure providers</strong> (Supabase, Railway, Resend, Stripe)
                strictly to operate the service. Each is bound by its own data-protection commitments.
              </li>
              <li>
                <strong>When legally required.</strong> Lawful court orders, subpoenas, and similar
                requests, in jurisdictions where we're obliged to comply.
              </li>
            </ul>
          </Section>

          <Section title="How long we keep it">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Active subscriptions:</strong> indefinitely while you continue to use the service.</li>
              <li><strong>Cancelled accounts:</strong> calibration records, photos, and account data are retained for 90 days, then permanently deleted unless you've requested earlier deletion.</li>
              <li><strong>Billing records:</strong> retained for 7 years to satisfy Australian taxation requirements.</li>
            </ul>
          </Section>

          <Section title="Your rights">
            <p>You can:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access</strong> a copy of your data (via the Reports section in-app, or by emailing us).</li>
              <li><strong>Correct</strong> inaccurate data — most fields are editable in-app.</li>
              <li><strong>Delete</strong> your account and all associated data, on request.</li>
              <li><strong>Export</strong> calibration history as CSV or PDF, in-app.</li>
              <li><strong>Withdraw consent</strong> for product update emails (transactional emails like cert delivery cannot be opted out of while you have an active subscription).</li>
            </ul>
            <p>
              Email <a href="mailto:info@calcheq.com" className="text-blue-600 hover:underline">info@calcheq.com</a> to exercise any of these. We aim to respond within 30 days.
            </p>
          </Section>

          <Section title="Cookies and similar">
            <p>
              We use a single category of browser storage: a session token issued by Supabase Auth,
              stored in <code>localStorage</code> (web) or the platform keystore (iOS Keychain /
              Android EncryptedSharedPreferences) on the mobile app. We don't use third-party
              advertising cookies, analytics cookies, or fingerprinting trackers.
            </p>
          </Section>

          <Section title="Children">
            <p>
              CalCheq is a workplace tool. We don't knowingly collect data from anyone under 18.
              If you believe a child has signed up, contact us and we'll remove the account.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              If we make material changes, we'll notify active subscribers by email at least 30 days
              before they take effect. The “last updated” date at the top of this page reflects the
              current version.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions, requests, or complaints about how we handle your data:
            </p>
            <p>
              <strong>Email:</strong> <a href="mailto:info@calcheq.com" className="text-blue-600 hover:underline">info@calcheq.com</a><br/>
              <strong>Post:</strong> Calcheq Pty Ltd, Australia
            </p>
            <p>
              If you're not satisfied with our response, you can lodge a complaint with the Office of
              the Australian Information Commissioner at <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">oaic.gov.au</a>.
            </p>
          </Section>

        </div>
      </main>

      <MarketingFooter />
    </>
  )
}
