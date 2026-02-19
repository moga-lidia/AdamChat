const API_URL =
  "https://lpm-api.hope.study/environments/DnPBv0mKWa/courses?published=true&rel=all&onlyMyGroups=true&exceptHidden=true&limit=100&offset=0";

const BASE_URL = "https://academiasperanta.ro/ro";

export interface Course {
  id: string;
  title: string;
  category: string;
  lessons: number;
  duration: number;
  imageUrl: string;
  courseUrl: string;
}

interface ApiCourse {
  id: string;
  title: string;
  pageAlias: string;
  cover?: { url: string };
  elementsCount: number;
  duration: number;
  mainCategory?: { title: string };
}

export async function fetchCourses(): Promise<Course[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data: ApiCourse[] = await res.json();

  return data.map((c) => ({
    id: c.id,
    title: c.title.trim(),
    category: c.mainCategory?.title ?? "",
    lessons: c.elementsCount,
    duration: c.duration,
    imageUrl: c.cover?.url ?? "",
    courseUrl: `${BASE_URL}/courses/${c.pageAlias}/`,
  }));
}

export const FALLBACK_COURSES: Course[] = [
  {
    id: "1",
    title: "Isus ne-a învățat",
    category: "Biblie",
    lessons: 9,
    duration: 270,
    imageUrl: "https://assets.hope.study/images/HsSqEhR1N.png",
    courseUrl: `${BASE_URL}/courses/Isus-ne-a-invatat/`,
  },
  {
    id: "2",
    title: "Biblia – mit, manipulare sau mesaj divin?",
    category: "Biblie",
    lessons: 4,
    duration: 34,
    imageUrl: "https://assets.hope.study/images/M8fU7dnOj.jpg",
    courseUrl: `${BASE_URL}/courses/Biblia-mit-manipulare-sau-mesaj-divin/`,
  },
  {
    id: "3",
    title: "Conflictul Cosmic. Te include și pe TINE",
    category: "Credință",
    lessons: 8,
    duration: 240,
    imageUrl: "https://assets.hope.study/images/pkV-MruaF.png",
    courseUrl: `${BASE_URL}/courses/conflictul/`,
  },
  {
    id: "4",
    title: "Credință și dovezi: confirmări arheologice ale Bibliei",
    category: "Arheologie",
    lessons: 8,
    duration: 240,
    imageUrl: "https://assets.hope.study/images/eMigtomPR.png",
    courseUrl: `${BASE_URL}/courses/credinta-si-dovezi/`,
  },
  {
    id: "5",
    title: "Cu Dumnezeu în suferință",
    category: "Credință",
    lessons: 8,
    duration: 235,
    imageUrl: "https://assets.hope.study/images/Xz3qrQcrH.png",
    courseUrl: `${BASE_URL}/courses/Cu-Dumnezeu-in-suferinta/`,
  },
  {
    id: "6",
    title: "Când viața doare: 7 adevăruri biblice despre suferință",
    category: "Credință",
    lessons: 7,
    duration: 37,
    imageUrl: "https://assets.hope.study/images/CODBb1ei6.jpg",
    courseUrl: `${BASE_URL}/courses/cand-viata-doare-7-adevaruri-biblice-despre-suferinta/`,
  },
  {
    id: "7",
    title: "Isus printre noi: revoluția relațiilor umane",
    category: "Biblie",
    lessons: 8,
    duration: 360,
    imageUrl: "https://assets.hope.study/images/jF1hsLrvP.png",
    courseUrl: `${BASE_URL}/courses/Isus-printre-noi-revolutia-relatiilor-umane/`,
  },
  {
    id: "8",
    title: "Masterclass de comunicare. Autenticitate, empatie, succes.",
    category: "Dezvoltare Personală",
    lessons: 8,
    duration: 240,
    imageUrl: "https://assets.hope.study/images/T8_K0WAIK.png",
    courseUrl: `${BASE_URL}/courses/masterclass-de-comunicare-autenticitate-empatie-succes/`,
  },
  {
    id: "9",
    title: "Masterclass microbiom",
    category: "Sănătate",
    lessons: 7,
    duration: 315,
    imageUrl: "https://assets.hope.study/images/fQuZ_cTKP.jpg",
    courseUrl: `${BASE_URL}/courses/masterclass-microbiom/`,
  },
  {
    id: "10",
    title: "Prima ta întâlnire cu Biblia - ce trebuie să știi",
    category: "Biblie",
    lessons: 5,
    duration: 38,
    imageUrl: "https://assets.hope.study/images/hWc7mkyuz.png",
    courseUrl: `${BASE_URL}/courses/prima-ta-intalnire-cu-Biblia-ce-trebuie-sa-stii/`,
  },
  {
    id: "11",
    title: "Un vis străvechi arată viitorul",
    category: "Profeție",
    lessons: 3,
    duration: 15,
    imageUrl: "https://assets.hope.study/images/QxdQNr53k.png",
    courseUrl: `${BASE_URL}/courses/un-vis-stravechi/`,
  },
  {
    id: "12",
    title: "Unicitatea uitată a creștinismului",
    category: "Credință",
    lessons: 8,
    duration: 240,
    imageUrl: "https://assets.hope.study/images/addEWkAX.jpg",
    courseUrl: `${BASE_URL}/courses/unicitatea-uitata-a-crestinismului/`,
  },
];
