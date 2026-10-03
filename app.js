const SUPABASE_URL = "https://kqvjyahyvxlcimaxszmp.supabase.co";
const SUPABASE_KEY = "sb_publishable_mD24M9ue05M3Nbl3yAPBTA_KkDvRe_o";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// ===============================
// ELEMENTOS
// ===============================

const registerBox = document.getElementById("registerBox");
const loginBox = document.getElementById("loginBox");
const dashboard = document.getElementById("dashboard");

const registerUsername = document.getElementById("registerUsername");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const registerBtn = document.getElementById("registerBtn");
const registerMessage = document.getElementById("registerMessage");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");

const showLoginBtn = document.getElementById("showLoginBtn");
const showRegisterBtn = document.getElementById("showRegisterBtn");

const usernameLabel = document.getElementById("usernameLabel");
const logoutBtn = document.getElementById("logoutBtn");

// ===============================
// CAMBIAR PANTALLA
// ===============================

function showBox(box) {

    registerBox.style.display = "none";
    loginBox.style.display = "none";
    dashboard.style.display = "none";

    box.style.display = "block";
}

// ===============================
// MENSAJES
// ===============================

function showMessage(element, text, error = false) {

    if (!element) return;

    element.textContent = text;

    element.style.color = error
        ? "#ff4d4d"
        : "#22c55e";
}

// ===============================
// IR A LOGIN
// ===============================

if (showLoginBtn) {

    showLoginBtn.addEventListener("click", () => {

        registerMessage.textContent = "";

        showBox(loginBox);
    });
}

// ===============================
// IR A REGISTRO
// ===============================

if (showRegisterBtn) {

    showRegisterBtn.addEventListener("click", () => {

        loginMessage.textContent = "";

        showBox(registerBox);
    });
}

// ===============================
// CREAR CUENTA
// ===============================

if (registerBtn) {

    registerBtn.addEventListener("click", async () => {

        const username =
            registerUsername.value.trim();

        const email =
            registerEmail.value.trim();

        const password =
            registerPassword.value;

        if (!username || !email || !password) {

            showMessage(
                registerMessage,
                "Completa todos los campos.",
                true
            );

            return;
        }

        if (password.length < 6) {

            showMessage(
                registerMessage,
                "La contraseña debe tener mínimo 6 caracteres.",
                true
            );

            return;
        }

        registerBtn.disabled = true;
        registerBtn.textContent = "Creando...";

        try {

            const { data, error } =
                await supabase.auth.signUp({

                    email: email,

                    password: password,

                    options: {

                        data: {
                            username: username
                        }

                    }

                });

            if (error) {

                console.error(error);

                showMessage(
                    registerMessage,
                    error.message,
                    true
                );

                registerBtn.disabled = false;
                registerBtn.textContent = "Crear cuenta";

                return;
            }

            if (data.session) {

                showMessage(
                    registerMessage,
                    "Cuenta creada correctamente."
                );

                setTimeout(() => {

                    loadDashboard(data.user);

                }, 500);

            } else {

                showMessage(
                    registerMessage,
                    "La cuenta fue creada, pero Supabase todavía requiere confirmación de correo.",
                    true
                );

            }

        } catch (error) {

            console.error(error);

            showMessage(
                registerMessage,
                "No se pudo crear la cuenta.",
                true
            );

        }

        registerBtn.disabled = false;
        registerBtn.textContent = "Crear cuenta";
    });
}

// ===============================
// INICIAR SESIÓN
// ===============================

if (loginBtn) {

    loginBtn.addEventListener("click", async () => {

        const email =
            loginEmail.value.trim();

        const password =
            loginPassword.value;

        if (!email || !password) {

            showMessage(
                loginMessage,
                "Escribe tu correo y contraseña.",
                true
            );

            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = "Entrando...";

        try {

            const { data, error } =
                await supabase.auth.signInWithPassword({

                    email: email,

                    password: password

                });

            if (error) {

                console.error(error);

                showMessage(
                    loginMessage,
                    error.message,
                    true
                );

                loginBtn.disabled = false;
                loginBtn.textContent = "Entrar";

                return;
            }

            loadDashboard(data.user);

        } catch (error) {

            console.error(error);

            showMessage(
                loginMessage,
                "No se pudo iniciar sesión.",
                true
            );

        }

        loginBtn.disabled = false;
        loginBtn.textContent = "Entrar";
    });
}

// ===============================
// ABRIR DASHBOARD
// ===============================

function loadDashboard(user) {

    if (!user) return;

    showBox(dashboard);

    const username =
        user.user_metadata?.username ||
        user.email?.split("@")[0] ||
        "Usuario";

    if (usernameLabel) {

        usernameLabel.textContent =
            username;
    }
}

// ===============================
// CERRAR SESIÓN
// ===============================

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        await supabase.auth.signOut();

        if (registerUsername)
            registerUsername.value = "";

        if (registerEmail)
            registerEmail.value = "";

        if (registerPassword)
            registerPassword.value = "";

        if (loginEmail)
            loginEmail.value = "";

        if (loginPassword)
            loginPassword.value = "";

        showBox(loginBox);
    });
}

// ===============================
// COMPROBAR SESIÓN
// ===============================

async function checkSession() {

    try {

        const { data, error } =
            await supabase.auth.getSession();

        if (error) {

            console.error(error);

            showBox(registerBox);

            return;
        }

        if (data.session) {

            loadDashboard(
                data.session.user
            );

        } else {

            showBox(registerBox);

        }

    } catch (error) {

        console.error(error);

        showBox(registerBox);
    }
}

// ===============================
// CAMBIOS DE SESIÓN
// ===============================

supabase.auth.onAuthStateChange(
    (event, session) => {

        if (session) {

            loadDashboard(
                session.user
            );

        }

    }
);

// ===============================
// INICIAR
// ===============================

checkSession();