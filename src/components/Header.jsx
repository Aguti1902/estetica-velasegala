import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../context/LanguageContext'
import { servicesData } from '../data/services'

const I = ({ d }) => (
  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
)

// Icono único por tratamiento (47 total, ninguno repetido)
const serviceIcons = {
  // ── Facial ──────────────────────────────────────────────────────
  1:  <I d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />,
  2:  <I d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
  3:  <I d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />,
  4:  <I d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285zM12 15.75h.007v.008H12v-.008z" />,
  5:  <I d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.912c-1.444 0-2.413-1.798-1.414-2.798L5 14.5" />,
  6:  <I d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />,
  7:  <I d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1010.625 12h2.75A2.625 2.625 0 0012 4.875zM3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v.75c0 .621.504 1.125 1.125 1.125z" />,
  8:  <I d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />,
  9:  <I d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-.865 3.674 3.745 3.745 0 01-3.674.865A3.735 3.735 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.674-.865 3.745 3.745 0 01-.865-3.674A3.735 3.735 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 01.865-3.674 3.745 3.745 0 013.674-.865A3.735 3.735 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.674.865 3.745 3.745 0 01.865 3.674A3.735 3.735 0 0121 12z" />,
  10: <I d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z" />,
  11: <I d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />,
  12: <I d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />,
  13: <I d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />,
  14: <I d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />,
  15: <I d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
  16: <I d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m.002 0h-.002" />,
  17: <I d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />,

  // ── Corporal ──────────────────────────────────────────────────────
  18: <I d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />,
  19: <I d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />,
  20: <I d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
  21: <I d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />,
  22: <I d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />,
  23: <I d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />,
  24: <I d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />,
  25: <I d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />,
  26: <I d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64" />,
  27: <I d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />,
  28: <I d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />,
  29: <I d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />,
  30: <I d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />,
  31: <I d="M9 9V4.5m0 5.25v4.5m0-4.5H4.5m4.5 0H9m0 0v4.5m0-9V9m0 0H4.5m4.5 0H9m0 9v4.5M9 18.75v.75m6-15v4.5m0-4.5V4.5m0 0v-.75m0 5.25v4.5m0-4.5h4.5m-4.5 0h-4.5m4.5 0v4.5m0-4.5V9m0 9v4.5m0 0v.75m0-5.25h4.5m-4.5 0h-4.5" />,

  // ── Mèdic-Estètic ──────────────────────────────────────────────────
  32: <I d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />,
  33: <I d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />,
  34: <I d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636" />,
  35: <I d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />,
  36: <I d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.912c-1.444 0-2.413-1.798-1.414-2.798L5 14.5M9 12h6" />,
  37: <I d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />,
  38: <I d="M12 4.5v15m7.5-7.5h-15" />,
  39: <I d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />,
  40: <I d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 19.5m9.75-15a1.125 1.125 0 011.125 1.125M21.375 5.625v1.5c0 .621-.504 1.125-1.125 1.125m0-3.75H3.375m0 0A1.125 1.125 0 002.25 6.75v1.5c0 .621.504 1.125 1.125 1.125M3.375 5.625h7.5c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621.504 1.125 1.125 1.125m0-3.75h7.5c.621 0 1.125.504 1.125 1.125m-1.125 2.625h-7.5A1.125 1.125 0 0112 9.375m0 0v6" />,
  41: <I d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-9 5.25-9-5.25v-2.25l9-5.25 9 5.25z" />,
  42: <I d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />,

  // ── Làser / Plexr / IPL ──────────────────────────────────────────────
  43: <I d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />,
  44: <I d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />,
  45: <I d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  46: <I d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />,
  47: <I d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />,
}

const categoryOrder = ['facial', 'corporal', 'medics', 'laser']
const categoryLabels = {
  es: { facial: 'Facial', corporal: 'Corporal', medics: 'Médico-Estético', laser: 'Láser' },
  ca: { facial: 'Facial', corporal: 'Corporal', medics: 'Mèdic-Estètic', laser: 'Làser' },
}

export default function Header() {
  const { t, lang, toggleLang } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(categoryOrder[0])
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  const location = useLocation()
  const dropdownRef = useRef(null)
  const services = servicesData[lang]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setServicesOpen(false)
  }, [location])

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setServicesOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/')

  const grouped = categoryOrder.map(cat => ({
    cat,
    label: categoryLabels[lang][cat],
    items: services.filter(s => s.category === cat),
  }))

  const activeItems = grouped.find(g => g.cat === activeTab)?.items ?? []

  return (
    <>
      {/* Topbar */}
      <div style={{ background: '#0d0d0d', color: '#fff', fontSize: '0.7rem', letterSpacing: '0.08em', padding: '10px 0' }} className="hidden md:block">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href={`tel:${t.topbar.phone.replace(/\s/g, '')}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
              <PhoneIcon /> {t.topbar.phone}
            </a>
            <a href={`mailto:${t.topbar.email}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
              <EmailIcon /> {t.topbar.email}
            </a>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ClockIcon /> {t.topbar.schedule}
          </span>
        </div>
      </div>

      {/* Navbar */}
      <motion.header
        initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ position: 'sticky', top: 0, zIndex: 50, background: scrolled ? 'rgba(249,246,241,0.97)' : 'var(--cream)', borderBottom: '1px solid var(--warm-200)', backdropFilter: scrolled ? 'blur(12px)' : 'none', transition: 'all 0.3s' }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px', position: 'relative' }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img src="/logo.png" alt="Vela Segalà Estètica" style={{ height: '48px', width: 'auto', objectFit: 'contain', display: 'block' }} />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex" style={{ gap: '0', alignItems: 'center' }}>

            {/* Servicios con dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
                onClick={() => setServicesOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: isActive('/servicios') ? '#0d0d0d' : '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '0 1rem', height: '70px', borderBottom: isActive('/servicios') ? '1.5px solid #0d0d0d' : '1.5px solid transparent', transition: 'color 0.2s' }}
                onFocus={() => setServicesOpen(true)}
              >
                {lang === 'es' ? 'Servicios' : 'Serveis'}
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: servicesOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Mega dropdown — tab layout */}
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18 }}
                    onMouseEnter={() => setServicesOpen(true)}
                    onMouseLeave={() => setServicesOpen(false)}
                    style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: '660px', background: '#fff', border: '1.5px solid #e8e8e8', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', zIndex: 100 }}
                  >
                    <div style={{ display: 'flex' }}>

                      {/* Sidebar de categorías */}
                      <div style={{ width: '160px', flexShrink: 0, borderRight: '1px solid #f0f0f0', padding: '10px 0' }}>
                        {grouped.map(group => (
                          <button
                            key={group.cat}
                            onMouseEnter={() => setActiveTab(group.cat)}
                            onClick={() => setActiveTab(group.cat)}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                              padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer',
                              borderLeft: `2px solid ${activeTab === group.cat ? '#0d0d0d' : 'transparent'}`,
                              transition: 'all 0.15s', textAlign: 'left',
                            }}
                          >
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: activeTab === group.cat ? '#0d0d0d' : '#a3a3a3', lineHeight: 1.3, transition: 'color 0.15s' }}>
                              {group.label}
                            </span>
                            <span style={{ marginLeft: 'auto', color: activeTab === group.cat ? '#0d0d0d' : '#d0d0d0', transition: 'color 0.15s' }}>
                              <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Panel de tratamientos en cuadrícula */}
                      <div style={{ flex: 1, padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', alignContent: 'start' }}>
                        {activeItems.map(service => (
                          <Link
                            key={service.id}
                            to={`/servicios/${service.slug}`}
                            onClick={() => setServicesOpen(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 10px', textDecoration: 'none', transition: 'background 0.15s', borderRadius: '2px' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                          >
                            <span style={{ color: '#9ca3af', flexShrink: 0, display: 'flex', lineHeight: 0 }}>
                              {serviceIcons[service.id]}
                            </span>
                            <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#1a1a1a', lineHeight: 1.3 }}>
                              {service.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ borderTop: '1px solid #f0f0f0', padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                      <span style={{ fontSize: '0.65rem', color: '#a3a3a3', letterSpacing: '0.06em' }}>
                        {lang === 'es' ? '47 tratamientos disponibles' : '47 tractaments disponibles'}
                      </span>
                      <Link to="/servicios" onClick={() => setServicesOpen(false)} style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0d0d0d', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {lang === 'es' ? 'Ver todos' : 'Veure tots'}
                        <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Resto de links */}
            {[
              { labelEs: 'Nosotros', labelCa: 'Nosaltres', to: '/sobre-nosotros' },
              { labelEs: 'Galería', labelCa: 'Galeria', to: '/galeria' },
              { labelEs: 'Contacto', labelCa: 'Contacte', to: '/contacto' },
              { labelEs: 'Tarjetas Regalo', labelCa: 'Targetes Regal', to: '/tarjetas-regalo' },
            ].map(link => (
              <Link key={link.to} to={link.to}
                style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: isActive(link.to) ? '#0d0d0d' : '#6b7280', textDecoration: 'none', padding: '0 1rem', height: '70px', display: 'flex', alignItems: 'center', borderBottom: isActive(link.to) ? '1.5px solid #0d0d0d' : '1.5px solid transparent', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#0d0d0d'}
                onMouseLeave={e => e.currentTarget.style.color = isActive(link.to) ? '#0d0d0d' : '#6b7280'}
              >
                {lang === 'es' ? link.labelEs : link.labelCa}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex" style={{ gap: '12px', alignItems: 'center', flexShrink: 0 }}>
            <button onClick={toggleLang}
              style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', background: 'none', border: '1px solid #e8e8e8', padding: '6px 14px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0d0d0d'; e.currentTarget.style.color = '#0d0d0d' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.style.color = '#6b7280' }}
            >{t.nav.lang}</button>
            <Link to="/contacto" className="btn-dark" style={{ padding: '10px 24px', fontSize: '0.7rem' }}>
              {t.nav.cta}
            </Link>
          </div>

          {/* Mobile burger */}
          <div className="flex lg:hidden" style={{ gap: '10px', alignItems: 'center' }}>
            <button onClick={toggleLang} style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', background: 'none', border: '1px solid #e8e8e8', padding: '5px 10px', cursor: 'pointer' }}>
              {t.nav.lang}
            </button>
            <button onClick={() => setMenuOpen(o => !o)}
              style={{ width: '40px', height: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer' }}
              aria-label="Menú">
              <motion.span style={{ display: 'block', width: '22px', height: '1.5px', background: '#0d0d0d' }} animate={menuOpen ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }} transition={{ duration: 0.2 }} />
              <motion.span style={{ display: 'block', width: '22px', height: '1.5px', background: '#0d0d0d' }} animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} transition={{ duration: 0.2 }} />
              <motion.span style={{ display: 'block', width: '22px', height: '1.5px', background: '#0d0d0d' }} animate={menuOpen ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }} transition={{ duration: 0.2 }} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
              className="lg:hidden"
              style={{ borderTop: '1px solid #e8e8e8', overflow: 'hidden', maxHeight: '80vh', overflowY: 'auto' }}
            >
              <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
                <Link to="/" style={{ display: 'block', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0d0d0d', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                  {lang === 'es' ? 'Inicio' : 'Inici'}
                </Link>

                {/* Servicios accordion */}
                <div style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <button
                    onClick={() => setMobileServicesOpen(o => !o)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0d0d0d', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 0' }}>
                    {lang === 'es' ? 'Servicios' : 'Serveis'}
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: mobileServicesOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {mobileServicesOpen && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                        {grouped.map(group => (
                          <div key={group.cat} style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#a3a3a3', padding: '8px 0 4px 12px' }}>{group.label}</div>
                            {group.items.map(service => (
                              <Link key={service.id} to={`/servicios/${service.slug}`}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', textDecoration: 'none', color: '#0d0d0d', fontSize: '0.82rem' }}>
                                <span style={{ color: '#9ca3af', lineHeight: 0 }}>{serviceIcons[service.id]}</span>
                                {service.name}
                              </Link>
                            ))}
                          </div>
                        ))}
                        <Link to="/servicios" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 12px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0d0d0d', textDecoration: 'none', background: '#f5f5f5', marginBottom: '0.5rem' }}>
                          {lang === 'es' ? 'Ver todos los servicios' : 'Veure tots els serveis'} →
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {[
                  { labelEs: 'Nosotros', labelCa: 'Nosaltres', to: '/sobre-nosotros' },
                  { labelEs: 'Galería', labelCa: 'Galeria', to: '/galeria' },
                  { labelEs: 'Contacto', labelCa: 'Contacte', to: '/contacto' },
                  { labelEs: 'Tarjetas Regalo', labelCa: 'Targetes Regal', to: '/tarjetas-regalo' },
                ].map(link => (
                  <Link key={link.to} to={link.to}
                    style={{ display: 'block', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0d0d0d', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                    {lang === 'es' ? link.labelEs : link.labelCa}
                  </Link>
                ))}
                <Link to="/contacto" className="btn-dark" style={{ marginTop: '1.5rem', justifyContent: 'center', padding: '14px', display: 'flex' }}>
                  {t.nav.cta}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}

function PhoneIcon() {
  return <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
}
function EmailIcon() {
  return <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
}
function ClockIcon() {
  return <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
