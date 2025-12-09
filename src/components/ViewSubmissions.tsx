import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  CircularProgress,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

interface Submission {
  id: number;
  sessionId: string;
  formData: object;
  createdAt: string;
}

interface RowProps {
  row: Submission;
}

function Row({ row }: RowProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.id}</TableCell>
        <TableCell>{row.sessionId}</TableCell>
        <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                Form Data
              </Typography>
              <Paper sx={{ p: 2, bgcolor: "grey.100" }}>
                <Box
                  component="pre"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    margin: 0,
                  }}
                >
                  {JSON.stringify(row.formData, null, 2)}
                </Box>
              </Paper>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

interface ViewSubmissionsProps {
  onBack: () => void;
}

const ViewSubmissions = ({ onBack }: ViewSubmissionsProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["submissions"],
    queryFn: async () => {
      const response = await fetch("/api/submissions");
      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }
      const result = await response.json();
      return result.data as Submission[];
    },
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button variant="outlined" onClick={onBack} sx={{ mb: 2 }}>
          ← Back to Form
        </Button>
        <Typography variant="h4" component="h1">
          Form Submissions
        </Typography>
      </Box>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Paper sx={{ p: 3 }}>
          <Typography color="error">
            Error loading submissions: {(error as Error).message}
          </Typography>
        </Paper>
      )}

      {data && data.length === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography>No submissions yet</Typography>
        </Paper>
      )}

      {data && data.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>ID</TableCell>
                <TableCell>Session ID</TableCell>
                <TableCell>Submitted At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <Row key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default ViewSubmissions;
