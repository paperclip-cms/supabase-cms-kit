export type Collection = {
  id: string;
  name: string;
  icon: string;
  entryCount: number;
  draftCount: number;
  lastUpdated: Date;
};

export type CollectionEntry = {
  id: string;
  title: string;
  status: "published" | "draft" | "archived";
  author: string;
  createdAt: Date;
  updatedAt: Date;
};

export const collections: Collection[] = [
  {
    id: "1",
    name: "Blog Posts",
    icon: "FileText",
    entryCount: 12,
    draftCount: 2,
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "2",
    name: "Van Log",
    icon: "Truck",
    entryCount: 24,
    draftCount: 0,
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: "3",
    name: "Pages",
    icon: "File",
    entryCount: 5,
    draftCount: 1,
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
  },
];

export const collectionEntries: Record<string, CollectionEntry[]> = {
  "1": [
    {
      id: "entry-1",
      title: "Getting Started with Next.js 15",
      status: "published",
      author: "Adam Bowker",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "entry-2",
      title: "Building a CMS with Supabase",
      status: "published",
      author: "Adam Bowker",
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: "entry-3",
      title: "Understanding React Server Components",
      status: "draft",
      author: "Adam Bowker",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "entry-4",
      title: "Tailwind CSS Tips and Tricks",
      status: "published",
      author: "Adam Bowker",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
    {
      id: "entry-5",
      title: "The Future of Web Development",
      status: "draft",
      author: "Adam Bowker",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  ],
  "2": [
    {
      id: "entry-6",
      title: "Cross Country Road Trip - Day 1",
      status: "published",
      author: "Adam Bowker",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
    {
      id: "entry-7",
      title: "Grand Canyon Adventure",
      status: "published",
      author: "Adam Bowker",
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  ],
  "3": [
    {
      id: "entry-8",
      title: "About",
      status: "published",
      author: "Adam Bowker",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: "entry-9",
      title: "Contact",
      status: "published",
      author: "Adam Bowker",
      createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    {
      id: "entry-10",
      title: "Privacy Policy",
      status: "draft",
      author: "Adam Bowker",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ],
};
