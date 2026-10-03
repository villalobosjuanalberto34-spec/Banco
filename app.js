const SUPABASE_URL = "https://zhctskrzbyxxpkskxvre.supabase.co";
const SUPABASE_KEY = "sb_publishable_ShhQ5CZMoxV7GorozoTd9A_O9TaSi_a";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

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

function showBox(box) {
    registerBox.style.display = "none";
    loginBox.style.display = "none";
    dashboard.style.display = "none";

    box.style.display = "block";
}

function message(element, text, error = false) {
    element.textContent = text;
    element.style.color = error ? "#ff4d4d" : "#22c55e";
}

// ===============================
// MOSTRAR REGISTRO
// ===============================

showLoginBtn.addEventListener("click", () => {
    registerMessage.textContent = "";
    showBox(loginBox);
});

showRegisterBtn.addEventListener("click", () => {
    loginMessage.textContent = "";
    showBox(registerBox);
});

// ===============================
// REGISTRO
// ===============================

registerBtn.addEventListener("click", async () => {

    const username = registerUsername.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value;

    if (!username || !email || !password) {
        message(
            registerMessage,
            "Completa todos los campos.",
            true
        );
        return;
    }

    if (password.length < 6) {
        message(
            registerMessage,
            "La contraseña debe tener mínimo 6 caracteres.",
            true
        );
        return;
    }

    registerBtn.disabled = true;
    registerBtn.textContent = "Creando...";

    try {

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username
                }
            }
        });

        if (error) {
            message(
                registerMessage,
                error.message,
                true
            );

            registerBtn.disabled = false;
            registerBtn.textContent = "Crear cuenta";
            return;
        }

        // Si Supabase crea la cuenta y devuelve sesión
        if (data.session) {

            message(
                registerMessage,
                "Cuenta creada correctamente."
            );

            setTimeout(() => {
                loadDashboard(data.session.user);
            }, 500);

        } else {

            // Si Supabase tiene activada la confirmación de email,
            // la cuenta puede quedar esperando confirmación.
            message(
                registerMessage,
                "Cuenta creada. Si Supabase pide confirmar el correo, desactiva la confirmación de email en Authentication."
            );
        }

    } catch (err) {

        message(
            registerMessage,
            "Ocurrió un error al crear la cuenta.",
            true
        );

        console.error(err);

    }

    registerBtn.disabled = false;
    registerBtn.textContent = "Crear cuenta";
});

// ===============================
// LOGIN
// ===============================

loginBtn.addEventListener("click", async () => {

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
        message(
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

            message(
                loginMessage,
                error.message,
                true
            );

            loginBtn.disabled = false;
            loginBtn.textContent = "Entrar";
            return;
        }

        loadDashboard(data.user);

    } catch (err) {

        message(
            loginMessage,
            "No se pudo iniciar sesión.",
            true
        );

        console.error(err);

    }

    loginBtn.disabled = false;
    loginBtn.textContent = "Entrar";
});

// ===============================
// DASHBOARD
// ===============================

function loadDashboard(user) {

    showBox(dashboard);

    const username =
        user.user_metadata?.username ||
        user.email?.split("@")[0] ||
        "Usuario";

    usernameLabel.textContent = username;
}

// ===============================
// CERRAR SESIÓN
// ===============================

logoutBtn.addEventListener("click", async () => {

    await supabase.auth.signOut();

    registerUsername.value = "";
    registerEmail.value = "";
    registerPassword.value = "";

    loginEmail.value = "";
    loginPassword.value = "";

    showBox(loginBox);
});

// ===============================
// COMPROBAR SESIÓN AL ABRIR
// ===============================

async function checkSession() {

    const { data } = await supabase.auth.getSession();

    if (data.session) {
        loadDashboard(data.session.user);
    } else {
        showBox(registerBox);
    }
}

checkSession();