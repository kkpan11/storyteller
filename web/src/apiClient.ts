import axios, { AxiosProgressEvent } from "axios"
import {
  Body_login_token_post,
  BookAuthor,
  BookDetail,
  Invite,
  InviteAccept,
  InviteRequest,
  Settings,
  Token,
  User,
  UserPermissions,
  UserRequest,
} from "./apiModels"

export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    public statusMessage: string,
  ) {
    const message = `${statusCode}: ${statusMessage}`
    super(message)
    this.name = "ApiClientError"
  }
}

export class ApiClient {
  constructor(
    private origin: string,
    private rootPath: string,
    private accessToken?: string,
  ) {}

  getHeaders() {
    return this.accessToken === undefined
      ? {}
      : { Authorization: `Bearer ${this.accessToken}` }
  }

  getSyncedDownloadUrl(bookUuid: string) {
    return `${this.rootPath}/books/${bookUuid}/synced`
  }

  getCoverUrl(bookUuid: string, audio = false) {
    const searchParams = new URLSearchParams()
    if (audio) {
      searchParams.append("audio", "true")
    }
    return `${this.rootPath}/books/${bookUuid}/cover?${searchParams.toString()}`
  }

  async needsInit(): Promise<boolean> {
    const url = new URL(`${this.rootPath}/needs-init`, this.origin)

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      if (response.status === 403) return false

      throw new ApiClientError(response.status, response.statusText)
    }

    return true
  }

  async login(creds: Body_login_token_post): Promise<Token> {
    const formData = new FormData()
    formData.set("username", creds.username)
    formData.set("password", creds.password)

    const url = new URL(`${this.rootPath}/token`, this.origin)

    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      credentials: "include",
      cache: "no-store",
      body: formData,
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }

    const token = (await response.json()) as Token
    return token
  }

  async logout(): Promise<void> {
    const url = new URL(`${this.rootPath}/logout`, this.origin)

    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }
  }

  async createInvite(inviteRequest: InviteRequest): Promise<Invite> {
    const url = new URL(`${this.rootPath}/invites`, this.origin)

    const response = await fetch(url, {
      method: "POST",
      headers: { ...this.getHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(inviteRequest),
      credentials: "include",
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }

    const invite = (await response.json()) as Invite
    return invite
  }

  async resendInvite(inviteKey: string): Promise<void> {
    const url = new URL(
      `${this.rootPath}/invites/${inviteKey}/send`,
      this.origin,
    )

    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }
  }

  async getInvite(inviteKey: string): Promise<Invite> {
    const url = new URL(`${this.rootPath}/invites/${inviteKey}`, this.origin)

    const response = await fetch(url, {
      headers: this.getHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }

    const invite = (await response.json()) as Invite
    return invite
  }

  async deleteInvite(inviteKey: string): Promise<void> {
    const url = new URL(`${this.rootPath}/invites/${inviteKey}`, this.origin)

    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }
  }

  async listInvites(): Promise<Invite[]> {
    const url = new URL(`${this.rootPath}/invites`, this.origin)

    const response = await fetch(url, {
      headers: this.getHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }

    const invites = (await response.json()) as Invite[]
    return invites
  }

  async acceptInvite(inviteAccept: InviteAccept): Promise<Token> {
    const url = new URL(`${this.rootPath}/users`, this.origin)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inviteAccept),
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }

    const token = (await response.json()) as Token
    return token
  }

  async listUsers(): Promise<User[]> {
    const url = new URL(`${this.rootPath}/users`, this.origin)

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }

    const users = (await response.json()) as User[]
    return users
  }

  async createAdminUser(userRequest: UserRequest): Promise<Token> {
    const url = new URL(`${this.rootPath}/users/admin`, this.origin)

    const response = await fetch(url, {
      method: "POST",
      headers: { ...this.getHeaders(), "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userRequest),
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }

    const token = (await response.json()) as Token
    return token
  }

  async deleteUser(uuid: string): Promise<void> {
    const url = new URL(`${this.rootPath}/users/${uuid}`, this.origin)

    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }
  }

  async updateUser(uuid: string, permissions: UserPermissions): Promise<void> {
    const url = new URL(`${this.rootPath}/users/${uuid}`, this.origin)

    const response = await fetch(url, {
      method: "PUT",
      headers: this.getHeaders(),
      credentials: "include",
      body: JSON.stringify({ permissions }),
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }
  }

  async getCurrentUser(): Promise<User> {
    const url = new URL(`${this.rootPath}/user`, this.origin)

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }

    const user = (await response.json()) as User
    return user
  }

  async getSettings(): Promise<Settings> {
    const url = new URL(`${this.rootPath}/settings`, this.origin)

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
      credentials: "include",
      cache: "no-cache",
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }

    const settings = (await response.json()) as Settings
    return settings
  }

  async updateSettings(settings: Required<Settings>) {
    const url = new URL(`${this.rootPath}/settings`, this.origin)

    const response = await fetch(url, {
      method: "PUT",
      headers: { ...this.getHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(settings),
      credentials: "include",
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }
  }

  async deleteBook(bookUuid: string): Promise<void> {
    const url = new URL(`${this.rootPath}/books/${bookUuid}`, this.origin)

    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }
  }

  async deleteBookAssets(bookUuid: string, originals?: boolean): Promise<void> {
    const url = new URL(`${this.rootPath}/books/${bookUuid}/cache`, this.origin)
    if (originals) {
      url.searchParams.set("originals", "true")
    }

    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }
  }

  async listBooks(): Promise<BookDetail[]> {
    const url = new URL(`${this.rootPath}/books`, this.origin)

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }

    const books = (await response.json()) as BookDetail[]
    return books
  }

  async uploadBookEpub(
    file: File,
    onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
  ): Promise<BookDetail> {
    const url = new URL(`${this.rootPath}/books/epub`, this.origin)

    const response = await axios.postForm<BookDetail>(
      url.toString(),
      { file },
      { withCredentials: true, onUploadProgress },
    )

    if (response.status > 299) {
      throw new ApiClientError(response.status, response.statusText)
    }

    const book = response.data
    return book
  }

  async createBook(epubFile: string, audioFiles: string[]): Promise<BookDetail>
  async createBook(
    epubFile: File,
    audioFiles: File[],
    onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
  ): Promise<BookDetail>
  async createBook(
    epubFile: File | string,
    audioFiles: File[] | string[],
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
  ): Promise<BookDetail> {
    const url = new URL(`${this.rootPath}/books/`, this.origin)

    if (typeof epubFile === "string" && Array.isArray(audioFiles)) {
      const response = await fetch(url, {
        method: "POST",
        headers: { ...this.getHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          epub_path: epubFile,
          audio_paths: audioFiles,
        }),
      })

      if (response.status > 299) {
        throw new ApiClientError(response.status, response.statusText)
      }

      return (await response.json()) as BookDetail
    }
    const response = await axios.postForm<BookDetail>(
      url.toString(),
      {
        epub_file: epubFile,
        audio_files: audioFiles,
      },
      {
        formSerializer: { indexes: null },
        withCredentials: true,
        // If we get to the overload with Files rather than strings,
        // onUploadProgress is definitely provided
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        onUploadProgress: onUploadProgress!,
      },
    )

    if (response.status > 299) {
      throw new ApiClientError(response.status, response.statusText)
    }

    return response.data
  }

  async uploadBookAudio(
    bookUuid: string,
    files: FileList,
    onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
  ): Promise<void> {
    const url = new URL(`${this.rootPath}/books/${bookUuid}/audio`, this.origin)

    const response = await axios.postForm<BookDetail>(
      url.toString(),
      { files },
      {
        formSerializer: { indexes: null },
        withCredentials: true,
        onUploadProgress,
      },
    )

    if (response.status > 299) {
      throw new ApiClientError(response.status, response.statusText)
    }
  }

  async processBook(bookUuid: string, restart?: boolean): Promise<void> {
    const url = new URL(
      `${this.rootPath}/books/${bookUuid}/process`,
      this.origin,
    )
    if (restart) {
      url.search = new URLSearchParams({ restart: "true" }).toString()
    }

    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }
  }

  async cancelProcessing(bookUuid: string): Promise<void> {
    const url = new URL(
      `${this.rootPath}/books/${bookUuid}/process`,
      this.origin,
    )

    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }
  }

  async getBookDetails(bookUuid: string): Promise<BookDetail> {
    const url = new URL(`${this.rootPath}/books/${bookUuid}`, this.origin)

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
      credentials: "include",
    })

    if (!response.ok) {
      throw new ApiClientError(response.status, response.statusText)
    }

    const book = (await response.json()) as BookDetail
    return book
  }

  async updateBook(
    bookUuid: string,
    title: string,
    language: string | null,
    authors: BookAuthor[],
    textCover: File | null,
    audioCover: File | null,
  ): Promise<BookDetail> {
    const url = new URL(`${this.rootPath}/books/${bookUuid}`, this.origin)

    const body = new FormData()
    body.append("title", title)
    if (language !== null) {
      body.append("language", language)
    }
    for (const author of authors) {
      body.append("authors", JSON.stringify(author))
    }

    if (textCover !== null) {
      body.append("text_cover", textCover)
    }

    if (audioCover !== null) {
      body.append("audio_cover", audioCover)
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: { ...this.getHeaders() },
      credentials: "include",
      body,
    })

    if (!response.ok) {
      console.error(await response.json())
      throw new ApiClientError(response.status, response.statusText)
    }

    const book = (await response.json()) as BookDetail
    return book
  }
}
