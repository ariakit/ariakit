export const members = [
  { name: "John Smith", email: "john@example.com" },
  { name: "Emma Johnson", email: "emma@example.com" },
  { name: "Michael Brown", email: "michael@example.com" },
  { name: "Sarah Davis", email: "sarah@example.com" },
];

export const files = [
  { name: "annual_report.pdf", folder: "Documents" },
  { name: "project_plan.docx", folder: "Documents" },
  { name: "logo.png", folder: "Images" },
  { name: "team_photo.jpg", folder: "Images" },
  { name: "main.js", folder: "Code" },
  { name: "styles.css", folder: "Code" },
  { name: "data.json", folder: "Code" },
  { name: "images_backup.tar.gz", folder: "Archives" },
  { name: "legacy_code.zip", folder: "Archives" },
];

const data = [...members, ...files];

export default data;
