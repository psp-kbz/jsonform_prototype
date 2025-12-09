import { withJsonFormsControlProps } from "@jsonforms/react";
import { Box, Typography, Button, TextField } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useState } from "react";

interface FileUploadControlProps {
  data: string;
  handleChange: (path: string, value: string) => void;
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

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFileName(file.name);

    try {
      // Convert file to data URL (base64)
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        handleChange(path, dataUrl);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploading(false);
    }
  };

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
        {(fileName || data) && (
          <TextField
            value={fileName || "File uploaded"}
            disabled
            size="small"
            sx={{ flexGrow: 1 }}
          />
        )}
      </Box>
      {errors && (
        <Typography variant="caption" color="error">
          {errors}
        </Typography>
      )}
    </Box>
  );
};

export default withJsonFormsControlProps(FileUploadControl);
