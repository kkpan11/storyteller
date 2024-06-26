import { ApiClientError } from "@/apiClient"
import { Settings } from "@/apiModels"
import { redirect } from "next/navigation"
import styles from "./page.module.css"
import { revalidatePath } from "next/cache"
import { createAuthedApiClient } from "@/authedApiClient"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const client = createAuthedApiClient()

  let settings: Settings

  try {
    settings = await client.getSettings()
  } catch (e) {
    if (e instanceof ApiClientError && e.statusCode === 401) {
      return redirect("/login")
    }

    if (e instanceof ApiClientError && e.statusCode === 403) {
      return (
        <main className={styles["main"]}>
          <h2>Forbidden</h2>
          <p>You don&apos;t have permission to see this page</p>
        </main>
      )
    }

    console.error(e)

    return (
      <main className={styles["main"]}>
        <h2>API is down</h2>
        <p>Storyteller couldn&apos;t connect to the Storyteller API</p>
      </main>
    )
  }

  async function updateSettings(data: FormData) {
    "use server"

    const libraryName = data.get("library-name")?.valueOf() as string
    const webUrl = data.get("web-url")?.valueOf() as string

    const codecString = data.get("codec")?.valueOf() as string
    const codec = codecString === "" ? undefined : codecString
    const bitrateString = data.get("bitrate")?.valueOf() as string
    const bitrate = bitrateString === "" ? undefined : bitrateString

    const smtpFrom = data.get("smtp-from")?.valueOf() as string
    const smtpHost = data.get("smtp-host")?.valueOf() as string
    const smtpPort = data.get("smtp-port")?.valueOf() as string
    const smtpUsername = data.get("smtp-username")?.valueOf() as string
    const smtpPassword = data.get("smtp-password")?.valueOf() as string
    const smtpSsl = data.get("smtp-ssl")?.valueOf() as boolean
    const smtpRejectUnauthorized = data
      .get("smtp-reject-unauthorized")
      ?.valueOf() as boolean

    const client = createAuthedApiClient()

    await client.updateSettings({
      library_name: libraryName,
      web_url: webUrl,
      smtp_from: smtpFrom,
      smtp_host: smtpHost,
      smtp_port: parseInt(smtpPort, 10),
      smtp_username: smtpUsername,
      smtp_password: smtpPassword,
      smtp_ssl: smtpSsl,
      smtp_reject_unauthorized: smtpRejectUnauthorized,
      codec,
      bitrate,
    })
    revalidatePath("/settings")
  }

  return (
    <main className={styles["main"]}>
      <h2>Settings</h2>
      <form className={styles["settings-form"]} action={updateSettings}>
        <fieldset>
          <legend>Library settings</legend>
          <label id="library-name-label" htmlFor="library-name">
            Library name
            <input
              id="library-name"
              name="library-name"
              defaultValue={settings.library_name}
            />
          </label>
          <label id="web-url-label" htmlFor="web-url">
            Web URL
            <input
              id="web-url"
              name="web-url"
              defaultValue={settings.web_url}
            />
          </label>
        </fieldset>
        <fieldset>
          <legend>Audio settings</legend>
          <label id="codec-label" htmlFor="codec">
            Preferred audio codec
            <select id="codec" name="codec" defaultValue={settings.codec ?? ""}>
              <option value="">Default</option>
              <option value="libopus">OPUS</option>
            </select>
          </label>
          <label id="bitrate-label" htmlFor="bitrate">
            Preferred audio bitrate
            <select
              id="bitrate"
              name="bitrate"
              defaultValue={settings.bitrate ?? ""}
            >
              <option value="">Default</option>
              <option value="16K">16 Kb/s</option>
              <option value="24K">24 Kb/s</option>
              <option value="32K">32 Kb/s</option>
              <option value="64K">64 Kb/s</option>
              <option value="96K">96 Kb/s</option>
            </select>
          </label>
        </fieldset>
        <fieldset>
          <legend>Email settings</legend>
          <label id="smtp-host-label" htmlFor="smtp-host">
            SMTP host
            <input
              id="smtp-host"
              name="smtp-host"
              defaultValue={settings.smtp_host}
            />
          </label>
          <label id="smtp-port-label" htmlFor="smtp-port">
            SMTP port
            <input
              id="smtp-port"
              name="smtp-port"
              type="number"
              defaultValue={settings.smtp_port}
            />
          </label>
          <label id="smtp-from-label" htmlFor="smtp-from">
            SMTP from
            <input
              id="smtp-from"
              name="smtp-from"
              defaultValue={settings.smtp_from}
            />
          </label>
          <label id="smtp-username-label" htmlFor="smtp-username">
            SMTP username
            <input
              id="smtp-username"
              name="smtp-username"
              defaultValue={settings.smtp_username}
            />
          </label>
          <label id="smtp-password-label" htmlFor="smtp-password">
            SMTP password
            <input
              id="smtp-password"
              name="smtp-password"
              defaultValue={settings.smtp_password}
            />
          </label>
          <label id="smtp-ssl-label" htmlFor="smtp-ssl">
            SMTP - Enable SSL?
            <input
              id="smtp-ssl"
              name="smtp-ssl"
              type="checkbox"
              defaultChecked={settings.smtp_ssl}
            />
          </label>
          <label
            id="smtp-reject-unauthorized-label"
            htmlFor="smtp-reject-unauthorized"
          >
            SMTP - Reject self-signed TLS certs?
            <input
              id="smtp-reject-unauthorized"
              name="smtp-reject-unauthorized"
              type="checkbox"
              defaultChecked={settings.smtp_reject_unauthorized}
            />
          </label>
          <p>
            <strong>Note:</strong> Only disable SSL and self-signed cert
            rejection if you use a locally hosted SMTP server. If you need to
            connect over the internet, keep SSL enabled!
          </p>
        </fieldset>
        <button type="submit">Update</button>
      </form>
    </main>
  )
}
