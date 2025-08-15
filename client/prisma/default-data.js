// prisma/default-data.js
export const defaultStories = [
  {
    id: "story-1",
    title: "Company Introduction",
    description: "A brief overview of our company, mission, and values",
    thumbnail: "/placeholder.svg?height=200&width=300",
    createdAt: "2023-01-15T12:00:00Z",
    updatedAt: "2023-01-20T15:30:00Z",
    slides: [
      {
        id: "slide-1",
        title: "Welcome",
        background: "#ffffff",
        elements: [
          {
            id: "element-1",
            type: "text",
            x: 400,
            y: 250,
            width: 480,
            height: 120,
            content: {
              text: "Company Introduction",
            },
            style: {
              fontSize: "48px",
              fontWeight: "bold",
              textAlign: "center",
              color: "#333333",
            },
          },
          {
            id: "element-2",
            type: "text",
            x: 400,
            y: 380,
            width: 480,
            height: 60,
            content: {
              text: "Our mission and values",
            },
            style: {
              fontSize: "24px",
              textAlign: "center",
              color: "#666666",
            },
          },
        ],
      },
      {
        id: "slide-2",
        title: "About Us",
        background: "#f8f9fa",
        elements: [
          {
            id: "element-3",
            type: "text",
            x: 100,
            y: 100,
            width: 400,
            height: 80,
            content: {
              text: "About Our Company",
            },
            style: {
              fontSize: "36px",
              fontWeight: "bold",
              color: "#333333",
            },
          },
          {
            id: "element-4",
            type: "text",
            x: 100,
            y: 200,
            width: 500,
            height: 300,
            content: {
              text: "Founded in 2010, our company has been at the forefront of innovation in our industry. We believe in creating value through technology and design thinking.",
            },
            style: {
              fontSize: "18px",
              lineHeight: "1.6",
              color: "#444444",
            },
          },
          {
            id: "element-5",
            type: "image",
            x: 650,
            y: 150,
            width: 400,
            height: 300,
            content: {
              src: "/placeholder.svg?height=300&width=400",
              alt: "Company image",
            },
            style: {},
          },
        ],
      },
      {
        id: "slide-3",
        title: "Our Services",
        background: "#ffffff",
        elements: [
          {
            id: "element-6",
            type: "text",
            x: 100,
            y: 100,
            width: 400,
            height: 80,
            content: {
              text: "Our Services",
            },
            style: {
              fontSize: "36px",
              fontWeight: "bold",
              color: "#333333",
            },
          },
          {
            id: "element-7",
            type: "text",
            x: 100,
            y: 200,
            width: 1000,
            height: 400,
            content: {
              text: "• Strategic consulting\n• Product development\n• Digital transformation\n• Customer experience design",
            },
            style: {
              fontSize: "24px",
              lineHeight: "2",
              color: "#444444",
            },
          },
        ],
      },
    ],
  },
  {
    id: "story-2",
    title: "Product Launch",
    description: "Introducing our new product to the market",
    thumbnail: "/placeholder.svg?height=200&width=300",
    createdAt: "2023-02-10T09:15:00Z",
    updatedAt: "2023-02-15T14:20:00Z",
    slides: [
      {
        id: "slide-1",
        title: "New Product",
        background: "#f0f8ff",
        elements: [
          {
            id: "element-1",
            type: "text",
            x: 400,
            y: 250,
            width: 480,
            height: 120,
            content: {
              text: "Introducing Our New Product",
            },
            style: {
              fontSize: "48px",
              fontWeight: "bold",
              textAlign: "center",
              color: "#0066cc",
            },
          },
          {
            id: "element-2",
            type: "text",
            x: 400,
            y: 380,
            width: 480,
            height: 60,
            content: {
              text: "Innovation meets simplicity",
            },
            style: {
              fontSize: "24px",
              textAlign: "center",
              color: "#666666",
            },
          },
        ],
      },
      {
        id: "slide-2",
        title: "Features",
        background: "#ffffff",
        elements: [
          {
            id: "element-3",
            type: "text",
            x: 100,
            y: 100,
            width: 400,
            height: 80,
            content: {
              text: "Key Features",
            },
            style: {
              fontSize: "36px",
              fontWeight: "bold",
              color: "#0066cc",
            },
          },
          {
            id: "element-4",
            type: "text",
            x: 100,
            y: 200,
            width: 500,
            height: 300,
            content: {
              text: "• Intuitive user interface\n• Advanced analytics\n• Cloud integration\n• Mobile compatibility",
            },
            style: {
              fontSize: "24px",
              lineHeight: "1.8",
              color: "#444444",
            },
          },
          {
            id: "element-5",
            type: "image",
            x: 650,
            y: 150,
            width: 400,
            height: 300,
            content: {
              src: "/placeholder.svg?height=300&width=400",
              alt: "Product screenshot",
            },
            style: {},
          },
        ],
      },
    ],
  },
  {
    id: "story-3",
    title: "Quarterly Results",
    description: "Financial performance and key metrics for Q1 2023",
    thumbnail: "/placeholder.svg?height=200&width=300",
    createdAt: "2023-03-05T10:30:00Z",
    updatedAt: "2023-03-10T16:45:00Z",
    slides: [
      {
        id: "slide-1",
        title: "Q1 Results",
        background: "#f5f5f5",
        elements: [
          {
            id: "element-1",
            type: "text",
            x: 400,
            y: 250,
            width: 480,
            height: 120,
            content: {
              text: "Q1 2023 Financial Results",
            },
            style: {
              fontSize: "48px",
              fontWeight: "bold",
              textAlign: "center",
              color: "#333333",
            },
          },
        ],
      },
      {
        id: "slide-2",
        title: "Revenue",
        background: "#ffffff",
        elements: [
          {
            id: "element-2",
            type: "text",
            x: 100,
            y: 100,
            width: 400,
            height: 80,
            content: {
              text: "Revenue Growth",
            },
            style: {
              fontSize: "36px",
              fontWeight: "bold",
              color: "#333333",
            },
          },
          {
            id: "element-3",
            type: "chart",
            x: 100,
            y: 200,
            width: 800,
            height: 400,
            content: {
              chartType: "bar",
              data: {
                labels: ["Jan", "Feb", "Mar"],
                datasets: [
                  {
                    label: "Revenue (millions)",
                    data: [4.2, 5.1, 6.3],
                  },
                ],
              },
            },
            style: {},
          },
        ],
      },
    ],
  },
];

export const defaultBlueprints = [
  {
    id: "blueprint-1",
    name: "Heading",
    type: "text",
    category: "text",
    defaultWidth: 600,
    defaultHeight: 100,
    defaultContent: {
      text: "Slide Heading",
    },
    defaultStyle: {
      fontSize: "36px",
      fontWeight: "bold",
      color: "#333333",
      textAlign: "left",
    },
  },
  {
    id: "blueprint-2",
    name: "Subheading",
    type: "text",
    category: "text",
    defaultWidth: 600,
    defaultHeight: 80,
    defaultContent: {
      text: "Slide Subheading",
    },
    defaultStyle: {
      fontSize: "24px",
      fontWeight: "normal",
      color: "#666666",
      textAlign: "left",
    },
  },
  {
    id: "blueprint-3",
    name: "Paragraph",
    type: "text",
    category: "text",
    defaultWidth: 600,
    defaultHeight: 200,
    defaultContent: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl.",
    },
    defaultStyle: {
      fontSize: "18px",
      lineHeight: "1.6",
      color: "#444444",
      textAlign: "left",
    },
  },
  {
    id: "blueprint-4",
    name: "Bullet Points",
    type: "text",
    category: "text",
    defaultWidth: 600,
    defaultHeight: 300,
    defaultContent: {
      text: "• Point one\n• Point two\n• Point three\n• Point four",
    },
    defaultStyle: {
      fontSize: "18px",
      lineHeight: "1.8",
      color: "#444444",
      textAlign: "left",
    },
  },
  {
    id: "blueprint-5",
    name: "Image",
    type: "image",
    category: "media",
    defaultWidth: 400,
    defaultHeight: 300,
    defaultContent: {
      src: "/placeholder.svg?height=300&width=400",
      alt: "Image description",
    },
    defaultStyle: {},
  },
  {
    id: "blueprint-6",
    name: "Bar Chart",
    type: "chart",
    category: "media",
    defaultWidth: 600,
    defaultHeight: 400,
    defaultContent: {
      chartType: "bar",
      data: {
        labels: ["Category 1", "Category 2", "Category 3"],
        datasets: [
          {
            label: "Dataset 1",
            data: [10, 20, 30],
          },
        ],
      },
    },
    defaultStyle: {},
  },
  {
    id: "blueprint-7",
    name: "Data Table",
    type: "table",
    category: "media",
    defaultWidth: 600,
    defaultHeight: 300,
    defaultContent: {
      headers: ["Column 1", "Column 2", "Column 3"],
      rows: [
        ["Data 1", "Data 2", "Data 3"],
        ["Data 4", "Data 5", "Data 6"],
        ["Data 7", "Data 8", "Data 9"],
      ],
    },
    defaultStyle: {},
  },
  {
    id: "blueprint-8",
    name: "Quote",
    type: "text",
    category: "text",
    defaultWidth: 600,
    defaultHeight: 200,
    defaultContent: {
      text: '"The best way to predict the future is to create it."',
    },
    defaultStyle: {
      fontSize: "24px",
      fontStyle: "italic",
      color: "#666666",
      textAlign: "center",
    },
  },
  {
    id: "blueprint-rectangle",
    name: "Rectangle",
    type: "rectangle",
    category: "shapes",
    defaultWidth: 200,
    defaultHeight: 100,
    defaultContent: {},
    defaultStyle: {},
    fill: "#000000",
  },
  {
    id: "blueprint-oval",
    name: "Oval",
    type: "oval",
    category: "shapes",
    defaultWidth: 200,
    defaultHeight: 100,
    defaultContent: {},
    defaultStyle: {},
    fill: "#000000",
  },
  {
    id: "blueprint-bar-chart",
    name: "Bar Chart",
    type: "chart",
    category: "media",
    defaultWidth: 600,
    defaultHeight: 400,
    defaultContent: {
      chartType: "bar",
    },
    defaultStyle: {},
  },
  {
    id: "blueprint-line-chart",
    name: "Line Chart",
    type: "chart",
    category: "media",
    defaultWidth: 600,
    defaultHeight: 400,
    defaultContent: {
      chartType: "line",
    },
    defaultStyle: {},
  },
];
