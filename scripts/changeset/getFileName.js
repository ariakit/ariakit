import path from 'path';

/**
 * Get the version of a specified package from the ${repo_name} packages directory.
 *
 * @param {string} output - The name of the repository.
 * @returns {string} The git log output.
 */
export function getChangesetFilename(output) {
  try {
      // Split the output into lines
      const lines = output.split('\n');

      // Find the line containing the filepath
      const filePathLine = lines.find(line => line.includes('.changeset/') && line.endsWith('.md'));

      if (!filePathLine) {
        console.error("Could not find changeset file path in command output", filePathLine);
        process.exit();
      }

      // Extract just the filename using path.basename
      // This will work across different OS path formats
      const fullPath = filePathLine.trim().split(' ').pop();
      if(!fullPath){
        console.error("Could not find changeset file path in command output", fullPath);
        process.exit();
      }

      const filename = path.basename(fullPath);
      console.log(">>>>> filename filename filename", filename);

      return filename;
  } catch (error) {
    console.error("Could not find changeset file path in command output", error);
    process.exit();
  }
}
