import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials

        console.log("Credentials:", credentials);

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          })

          const data = await res.json()

          console.log("Response data:", data);

          if (res.status === 401) {
            throw new Error(JSON.stringify(data))
          }

          if (res.status === 200 && data.user) {
            console.log("User data:", data.user);

            return {
              user: {
                id: data.user.id,
                name: data.user.username,
                apellidos: data.user.last_name,
                email: data.user.email,
                system_role: data.user.system_role || [], // Devolvemos el array de cargos
                system_role_description: data.user.system_role_description,
                is_active: data.user.is_active,
                create_at: data.user.date_joined
              },
              access_token: data.access_token,
              refresh_token: data.refresh_token
            };
          }

          return null
        } catch (e) {
          throw new Error(e.message)
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // Sesión válida por 30 días
  },

  pages: {
    signIn: '/login' // Página de inicio de sesión
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("User data in JWT callback:", user);
        
        token.userId = user.user.id;
        token.name = user.user.name;
        token.apellidos = user.user.apellidos;
        token.email = user.user.email;
        token.system_role = user.user.system_role || []; // Usamos "system_role" en vez de "cargo"
        token.system_role_description = user.user.system_role_description;
        token.is_active = user.user.is_active;
        token.create_at = user.user.create_at;

        token.accessToken = user.access_token;
        token.refreshToken = user.refresh_token;

        console.log("JWT Token:", token);
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId;
        session.user.username = token.username;
        session.user.apellidos = token.last_name;
        session.user.email = token.email;
        session.user.system_role = token.system_role || []; // Asignar "system_role" correctamente
        session.user.system_role_description = token.system_role_description;
        session.user.is_active = token.is_active;
        session.user.create_at = token.create_at;

        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken
        console.log("Session:", session);
        console.log("System role:", session?.user?.system_role);
      }

      return session
    }
  }
}
