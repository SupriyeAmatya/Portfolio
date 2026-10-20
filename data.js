/*
  Edit this file to update the site. No build step needed.

  PROJECTS → the grid cells.
    id       unique slug, used by notes to wire to a project
    title    project name
    year     shown on the cell
    role     what you did
    summary  one or two sentences, keep it short
    tags     a few keywords
    image    optional path, e.g. "img/office.png" (leave "" for a placeholder)
    links    [{ label: "Live", href: "https://..." }, { label: "Code", href: "https://github.com/..." }]

  NOTES → the draggable post-its.
    id       unique slug
    title / meta / body   short text
    wires    ids of other notes to connect with an always-visible wire
    projects ids of projects this note relates to (wired + highlighted on hover/drag)
*/

window.PORTFOLIO = {
  projects: [
    {
      id: "office-mgmt",
      title: "Office Management System",
      year: "2024",
      role: "Backend developer · MicroBanker Nepal",
      summary:
        "Built from scratch in .NET with clean architecture and identity services for token-based authentication and authorization.",
      tags: [".NET", "Clean Architecture", "MySQL"],
      image: "",
      links: [
        { label: "Case study", href: "#" },
        { label: "Code", href: "#" },
      ],
    },
    {
      id: "internet-banking",
      title: "Internet Banking System",
      year: "2023",
      role: "Backend developer · MicroBanker Nepal",
      summary: "Backend features for an internet banking platform. Add a short description of your part here.",
      tags: [".NET", "Auth", "MySQL"],
      image: "",
      links: [{ label: "Case study", href: "#" }],
    },
    {
      id: "amusement-park",
      title: "Amusement Park System",
      year: "2022",
      role: ".NET intern · EasySoftware",
      summary: "Worked alongside senior developers on the system and its MySQL data model.",
      tags: [".NET", "MySQL"],
      image: "",
      links: [{ label: "Details", href: "#" }],
    },
    {
      id: "library",
      title: "Library System",
      year: "2022",
      role: ".NET intern · EasySoftware",
      summary: "Data modelling and query performance work for a library management system.",
      tags: [".NET", "Data modelling"],
      image: "",
      links: [{ label: "Details", href: "#" }],
    },
    {
      id: "project-5",
      title: "Project title",
      year: "2026",
      role: "Your role",
      summary: "Placeholder. One or two sentences about the problem and what you built.",
      tags: ["Tag", "Tag"],
      image: "",
      links: [{ label: "Link", href: "#" }],
    },
    {
      id: "project-6",
      title: "Project title",
      year: "2026",
      role: "Your role",
      summary: "Placeholder. One or two sentences about the problem and what you built.",
      tags: ["Tag", "Tag"],
      image: "",
      links: [{ label: "Link", href: "#" }],
    },
  ],

  notes: [
    {
      id: "islington",
      title: "Islington College",
      meta: "2019–22",
      body: "BSc (Hons) Computing, London Met",
      wires: ["easysoftware"],
      projects: [],
    },
    {
      id: "easysoftware",
      title: "EasySoftware",
      meta: "2021–22",
      body: ".NET intern",
      wires: ["microbanker"],
      projects: ["amusement-park", "library"],
    },
    {
      id: "microbanker",
      title: "MicroBanker Nepal",
      meta: "2022–25",
      body: "Backend .NET developer",
      wires: ["stfx"],
      projects: ["office-mgmt", "internet-banking"],
    },
    {
      id: "stfx",
      title: "StFX University",
      meta: "2025–27",
      body: "Master of Applied Computer Science",
      wires: ["bloomfield"],
      projects: ["project-5", "project-6"],
    },
    {
      id: "bloomfield",
      title: "Bloomfield Hub",
      meta: "2026",
      body: "Peer support, StFX",
      wires: [],
      projects: [],
    },
    {
      id: "stack",
      title: "Stack",
      meta: "",
      body: "C# · .NET · MySQL · Git · Clean Architecture",
      wires: ["microbanker"],
      projects: ["office-mgmt", "internet-banking", "amusement-park", "library"],
    },
  ],
};
