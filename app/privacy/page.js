import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Ultimate Spare Parts",
  description:
    "Read our privacy policy to learn how Ultimate Spare Parts collects, uses, and protects your information while shopping for auto parts.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <section className="bg-white dark:bg-steel-950 border-b border-steel-200 dark:border-steel-800">
        <div className="max-w-6xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="inline-flex items-center rounded-full bg-brand-50 text-brand-700 px-3 py-1 text-sm font-semibold tracking-wide dark:bg-brand-500/10 dark:text-brand-300">
              Privacy Policy
            </p>
            <h1 className="mt-6 text-4xl sm:text-5xl font-heading font-bold tracking-tight">
              Your privacy is our priority.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-8">
              Ultimate Spare Parts is committed to protecting your personal information. This policy explains what we collect, how we use it, and the controls you have over your data.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-glow-orange transition hover:bg-brand-600"
              >
                Contact Support
              </Link>
              <Link
                href="/terms"
                className="inline-flex items-center justify-center rounded-full border border-brand-500 bg-transparent px-6 py-3 text-sm font-semibold text-brand-500 transition hover:bg-brand-50 dark:hover:bg-steel-800"
              >
                Read Terms
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
          <article className="space-y-12 text-slate-700 dark:text-slate-200">
            <div className="space-y-4">
              <h2 className="text-2xl font-heading font-bold">Information We Collect</h2>
              <p className="leading-8">
                We collect the information needed to process orders, provide customer support, and improve your shopping experience. That includes contact details, shipping and billing addresses, payment information, and order history.
              </p>
              <p className="leading-8">
                We also gather non-identifiable data such as browser type, device information, and pages visited to help us optimize the website and deliver better service.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading font-bold">How We Use Your Data</h2>
              <ul className="list-disc pl-5 space-y-3 leading-8">
                <li>Process and ship your orders.</li>
                <li>Provide customer service and order updates.</li>
                <li>Personalize your experience and recommend products.</li>
                <li>Send promotional emails when you opt in.</li>
                <li>Protect against fraud and unauthorized activity.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading font-bold">Cookies and Tracking</h2>
              <p className="leading-8">
                We use cookies and similar technologies to make the site work, remember your preferences, and measure visitor traffic. Cookies help us deliver faster checkout, personalized product suggestions, and site analytics.
              </p>
              <p className="leading-8">
                You can manage cookie settings through your browser, but disabling cookies may affect some features of the site.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading font-bold">Third-Party Services</h2>
              <p className="leading-8">
                We work with trusted service providers to process payments, fulfill orders, and run analytics. These partners may receive limited information required to perform their services, and they are prohibited from using it for any other purpose.
              </p>
              <p className="leading-8">
                Our third-party partners may include payment processors, shipping providers, marketing tools, and analytics platforms.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading font-bold">Data Security</h2>
              <p className="leading-8">
                We implement industry-standard security measures to protect your information from unauthorized access, disclosure, or alteration. This includes encryption, secure access controls, and regular monitoring.
              </p>
              <p className="leading-8">
                While we strive to protect your data, no online transmission can be guaranteed completely secure. If you suspect unauthorized access, please contact us immediately.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading font-bold">Your Rights</h2>
              <p className="leading-8">
                You may review, update, or delete your personal information by contacting our support team. If you have questions about how your data is handled, we will respond promptly and help you exercise your rights.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading font-bold">Policy Changes</h2>
              <p className="leading-8">
                We may update this privacy policy from time to time. When changes are significant, we will post an updated effective date and notify you as required by law.
              </p>
            </div>
          </article>

          <aside className="space-y-8 rounded-3xl border border-steel-200 bg-white px-6 py-8 shadow-card dark:border-steel-800 dark:bg-steel-900">
            <div>
              <h3 className="text-xl font-heading font-bold">Quick summary</h3>
              <p className="mt-3 text-slate-600 dark:text-slate-400 leading-7">
                We collect only the data needed to process orders and improve your experience. We never sell your personal information, and we protect it with strong security safeguards.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl bg-brand-50 p-5 dark:bg-brand-500/10">
              <h4 className="text-lg font-semibold">Need help?</h4>
              <p className="text-slate-700 dark:text-slate-200 leading-7">
                Visit our <Link href="/contact" className="text-brand-600 hover:underline dark:text-brand-400">contact page</Link> or email support to request information, update your profile, or report an issue.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-steel-200 bg-steel-50 p-5 dark:border-steel-700 dark:bg-steel-900">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Effective date</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">June 8, 2026</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
