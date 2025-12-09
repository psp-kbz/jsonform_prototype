import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { JsonForms } from "@jsonforms/react";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { useFormStore } from "../store/formStore";
import RatingControl from "./RatingControl";
import AgeSliderControl from "./AgeSliderControl";
import FileUploadControl from "./FileUploadControl";
import { ratingControlTester } from "../testers/ratingControlTester";
import { ageSliderControlTester } from "../testers/ageSliderControlTester";
import { fileUploadControlTester } from "../testers/fileUploadControlTester";
import ViewSubmissions from "./ViewSubmissions";
import defaultSchema from "../data/schema.json";

const renderers = [
  ...materialRenderers,
  { tester: ratingControlTester, renderer: RatingControl },
  { tester: ageSliderControlTester, renderer: AgeSliderControl },
  { tester: fileUploadControlTester, renderer: FileUploadControl },
];

const JsonFormsDemo = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { schema, data, setSchema, setData } = useFormStore();
  const [schemaText, setSchemaText] = useState(
    JSON.stringify((schema as any)?.type ? schema : defaultSchema, null, 2)
  );
  const [showSubmissions, setShowSubmissions] = useState(false);

  // Initialize schema if empty
  if (!(schema as any)?.type) {
    setSchema(defaultSchema);
  }

  const submitMutation = useMutation({
    mutationFn: async (formData: object) => {
      const sessionId = `session-${Date.now()}`;
      const hasFiles = Object.values(formData).some((v) => v instanceof File);

      let response;
      if (hasFiles) {
        // Send as FormData if there are files
        const formDataObj = new FormData();
        const cleanData: any = {};

        for (const [key, value] of Object.entries(formData)) {
          if (value instanceof File) {
            formDataObj.append(key, value);
          } else {
            cleanData[key] = value;
          }
        }

        formDataObj.append("data", JSON.stringify(cleanData));
        formDataObj.append("schema", JSON.stringify(schema));
        formDataObj.append("sessionId", sessionId);

        response = await fetch("/api/submit", {
          method: "POST",
          body: formDataObj,
        });
      } else {
        // Send as JSON if no files
        response = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: formData, schema, sessionId }),
        });
      }

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      // Show immediate success toast
      enqueueSnackbar("Form submitted successfully!", { variant: "success" });

      // Clear form data immediately after submission
      setData({});

      // Connect to SSE for async processing in background (don't await)
      const eventSource = new EventSource(`/api/events/${sessionId}`);

      eventSource.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === "complete") {
          enqueueSnackbar("Data synced to database successfully!", {
            variant: "success",
          });
          eventSource.close();
        } else if (message.type === "error") {
          enqueueSnackbar("Data sync failed", { variant: "error" });
          eventSource.close();
        }
      };

      eventSource.onerror = () => {
        enqueueSnackbar("Connection to sync service failed", {
          variant: "warning",
        });
        eventSource.close();
      };

      // Return immediately without waiting for SSE
      return { sessionId };
    },
    onError: (error: Error) => {
      enqueueSnackbar(`Error: ${error.message}`, { variant: "error" });
    },
  });

  const handleFormatAndSave = () => {
    try {
      const parsed = JSON.parse(schemaText);
      setSchema(parsed);
      enqueueSnackbar("Schema updated successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Invalid JSON schema", { variant: "error" });
    }
  };

  const handleSubmit = () => {
    submitMutation.mutate(data);
  };

  if (showSubmissions) {
    return <ViewSubmissions onBack={() => setShowSubmissions(false)} />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1">
          JSON Forms Dynamic Form Builder
        </Typography>
        <Button variant="outlined" onClick={() => setShowSubmissions(true)}>
          View Submissions
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Panel - Schema Editor */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              height: "700px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" gutterBottom>
              JSON Schema
            </Typography>
            <TextField
              multiline
              fullWidth
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              sx={{ flexGrow: 1, fontFamily: "monospace", mb: 2 }}
              InputProps={{
                sx: { fontFamily: "monospace", fontSize: "0.875rem" },
              }}
            />
            <Button variant="contained" onClick={handleFormatAndSave} fullWidth>
              Format & Save
            </Button>
          </Paper>
        </Grid>

        {/* Middle Panel - Form */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: "700px", overflow: "auto" }}>
            <Typography variant="h6" gutterBottom>
              Generated Form
            </Typography>
            <JsonForms
              schema={schema}
              data={data}
              renderers={renderers}
              cells={materialCells}
              onChange={({ data: newData }) => setData(newData)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              fullWidth
              sx={{ mt: 2 }}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </Paper>
        </Grid>

        {/* Right Panel - Bound Data */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: "700px", overflow: "auto" }}>
            <Typography variant="h6" gutterBottom>
              Bound Data
            </Typography>
            <Box
              component="pre"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.875rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {JSON.stringify(data, null, 2)}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default JsonFormsDemo;
