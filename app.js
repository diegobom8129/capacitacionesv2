/* ============================================================
   CONFIGURACIÓN — REEMPLAZA ESTOS VALORES CON LOS TUYOS
   ============================================================ */
const SUPABASE_URL = "https://rkmbktaqdgxfsfyjjfzx.supabase.co/rest/v1/capacitaciones?select=*";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbWJrdGFxZGd4ZnNmeWpqZnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0OTU3ODMsImV4cCI6MjExMDA3MTc4M30.oduucnn8DP6Hg9jhdmofQ_KFEkwFjbcApN2UihvDDcw";

// Nombre de la tabla (ajústalo si tu tabla se llama distinto)
const TABLE_NAME = "cursos";

// Endpoint REST de Supabase
const API_URL = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*`;

/* ============================================================
   REFERENCIAS AL DOM
   ============================================================ */
const loaderEl = document.getElementById("loader");
const errorEl = document.getElementById("error");
const gridEl = document.getElementById("courses-grid");
const emptyEl = document.getElementById("empty-state");
const yearEl = document.getElementById("year");

yearEl.textContent = new Date().getFullYear();

/* ============================================================
   UTILIDADES
   ============================================================ */

/**
 * Escapa texto para evitar inyección de HTML.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Devuelve las iniciales de un título para el placeholder de imagen.
 */
function getInitials(title) {
  if (!title) return "?";
  return title
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

/**
 * Crea el HTML interno de una tarjeta de curso.
 * Se adapta dinámicamente a los campos que existan en el objeto.
 */
function buildCard(course) {
  const title =
    course.nombre ||
    course.titulo ||
    course.title ||
    "Curso sin título";

  const description =
    course.desscripcion||
    course.desscripcion ||
    "Sin descripción disponible.";

  const image =
    course.imagen ||
    course.imagen_url ||
    course.image ||
    course.thumbnail ||
    null;

  const duration =
    course.duracion ||
    course.duration ||
    course.horas ||
    null;

  const level =
    course.nivel ||
    course.level ||
    course.modalidad ||
    null;

  const category =
    course.categoria ||
    course.category ||
    course.tipo ||
    null;

  const imageHtml = image
    ? `<img class="card__image" src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'card__image card__image--placeholder',textContent:'${escapeHtml(getInitials(title))}'}))">`
    : `<div class="card__image card__image--placeholder">${escapeHtml(getInitials(title))}</div>`;

  const badges = [];
  if (duration) {
    badges.push(`<span class="badge badge--duration">⏱ ${escapeHtml(duration)}</span>`);
  }
  if (level) {
    badges.push(`<span class="badge badge--level">${escapeHtml(level)}</span>`);
  }
  if (category) {
    badges.push(`<span class="badge">${escapeHtml(category)}</span>`);
  }

  return `
    <article class="card">
      ${imageHtml}
      <div class="card__body">
        <h2 class="card__title">${escapeHtml(title)}</h2>
        <p class="card__description">${escapeHtml(description)}</p>
        ${badges.length ? `<div class="card__meta">${badges.join("")}</div>` : ""}
      </div>
    </article>
  `;
}

/* ============================================================
   RENDERIZADO
   ============================================================ */
function renderCourses(courses) {
  gridEl.innerHTML = "";

  if (!Array.isArray(courses) || courses.length === 0) {
    emptyEl.classList.remove("hidden");
    return;
  }

  emptyEl.classList.add("hidden");
  gridEl.innerHTML = courses.map(buildCard).join("");
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

function hideLoader() {
  loaderEl.classList.add("hidden");
}

/* ============================================================
   CONSUMO DE LA API
   ============================================================ */
async function fetchCourses() {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error ${response.status}: ${errorText || response.statusText}`
      );
    }

    const data = await response.json();
    renderCourses(data);
  } catch (err) {
    console.error("Error al cargar cursos:", err);
    showError(
      "No se pudieron cargar los cursos. Verifica tu conexión o la configuración de la API."
    );
  } finally {
    hideLoader();
  }
}

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */
document.addEventListener("DOMContentLoaded", fetchCourses);