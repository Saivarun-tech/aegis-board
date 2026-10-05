export type AegisUserRole =
  | "admin"
  | "employee";

export type AegisUser = {
  id: string;
  name: string;
  email: string;
  role: AegisUserRole;
};

type StoredAccount = AegisUser & {
  passwordHash: string;
};

const ACCOUNTS_KEY =
  "aegis.accounts";

const SESSION_KEY =
  "aegis.session";

const hashPassword = async (
  password: string,
): Promise<string> => {
  const data =
    new TextEncoder().encode(
      password,
    );

  const hash =
    await crypto.subtle.digest(
      "SHA-256",
      data,
    );

  return Array.from(
    new Uint8Array(hash),
  )
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
};

const readAccounts =
  (): StoredAccount[] => {
    try {
      const raw =
        localStorage.getItem(
          ACCOUNTS_KEY,
        );

      if (!raw) {
        return [];
      }

      return JSON.parse(
        raw,
      ) as StoredAccount[];
    } catch {
      return [];
    }
  };

const writeAccounts = (
  accounts: StoredAccount[],
) => {
  localStorage.setItem(
    ACCOUNTS_KEY,
    JSON.stringify(
      accounts,
    ),
  );
};

export const getCurrentUser =
  (): AegisUser | null => {
    try {
      const raw =
        localStorage.getItem(
          SESSION_KEY,
        );

      if (!raw) {
        return null;
      }

      return JSON.parse(
        raw,
      ) as AegisUser;
    } catch {
      return null;
    }
  };

export const hasAdminAccount =
  (): boolean => {
    return readAccounts().some(
      (account) =>
        account.role ===
        "admin",
    );
  };

export const createFirstAdmin =
  async (
    name: string,
    email: string,
    password: string,
  ): Promise<AegisUser> => {
    const accounts =
      readAccounts();

    if (
      accounts.some(
        (account) =>
          account.role ===
          "admin",
      )
    ) {
      throw new Error(
        "An Aegis admin account already exists.",
      );
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const passwordHash =
      await hashPassword(
        password,
      );

    const user: AegisUser = {
      id:
        crypto.randomUUID(),
      name:
        name.trim(),
      email:
        normalizedEmail,
      role:
        "admin",
    };

    const account: StoredAccount =
      {
        ...user,
        passwordHash,
      };

    writeAccounts([
      ...accounts,
      account,
    ]);

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(
        user,
      ),
    );

    return user;
  };

export const loginUser =
  async (
    email: string,
    password: string,
  ): Promise<AegisUser> => {
    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const accounts =
      readAccounts();

    const account =
      accounts.find(
        (item) =>
          item.email ===
          normalizedEmail,
      );

    if (!account) {
      throw new Error(
        "Invalid email or password.",
      );
    }

    const passwordHash =
      await hashPassword(
        password,
      );

    if (
      account.passwordHash !==
      passwordHash
    ) {
      throw new Error(
        "Invalid email or password.",
      );
    }

    const user: AegisUser =
      {
        id:
          account.id,
        name:
          account.name,
        email:
          account.email,
        role:
          account.role,
      };

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(
        user,
      ),
    );

    return user;
  };

export const logoutUser =
  () => {
    localStorage.removeItem(
      SESSION_KEY,
    );
  };