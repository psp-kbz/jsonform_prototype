import { withJsonFormsControlProps } from "@jsonforms/react";
import { Box, Typography, Button, TextField, Link } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useState } from "react";
import { useUploadThing } from "../utils/uploadthing";

interface FileUploadControlProps {
  data: any;
  handleChange: (path: string, value: any) => void;
  path: string;
  label: string;
  errors?: string;
  visible?: boolean;
}

const FileUploadControl = ({
  data,
  handleChange,
  path,
  label,
  errors,
  visible = true,
}: FileUploadControlProps) => {
  if (!visible) return null;

  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const { startUpload } = useUploadThing("fileUploader", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        // Store an object with both url and filename for better display
        handleChange(path, {
          url: res[0].url,
          name: fileName || res[0].name,
        });
        setUploading(false);
      }
    },
    onUploadError: (error: Error) => {
      console.error("Upload failed:", error);
      setUploading(false);
    },
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFileName(file.name);

    try {
      await startUpload([file]);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploading(false);
    }
  };

  // Extract filename from data (handle both old string format and new object format)
  const displayName = typeof data === "string" 
    ? data.split("/").pop() || data 
    : data?.name || "";
  
  const fileUrl = typeof data === "string" ? data : data?.url;

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload File"}
          <input
            type="file"
            hidden
            onChange={handleFileChange}
            accept="image/*,.pdf"
          />
        </Button>
        {fileUrl && (
          <TextField
            value={displayName}
            disabled
            size="small"
            sx={{ flexGrow: 1 }}
            placeholder="File name will appear here"
            InputProps={{
              endAdornment: (
                <Link href={fileUrl} target="_blank" rel="noopener" sx={{ ml: 1 }}>
                  View
                </Link>
              ),
            }}
          />
        )}
      </Box>
      {/* Don't show type validation errors for file uploads */}
      {errors && !errors.includes("must be") && (
        <Typography variant="caption" color="error">
          {errors}
        </Typography>
      )}
    </Box>
  );
};

export default withJsonFormsControlProps(FileUploadControl);
