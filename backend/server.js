const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/CarRally", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Winner Schema & Model
const winnerSchema = new mongoose.Schema({
  name: String,
  date: String,
  location: String,
  participants: String,
  first: String,
  second: String,
  third: String,
  leastPenalty: String,
});
const Winner = mongoose.model("Winner", winnerSchema);

// Participant Schema & Model (Renamed to Event for clarity)
const eventSchema = new mongoose.Schema({
  name: String,
  date: String,
  place: String,
});
const Event = mongoose.model("Event", eventSchema);

// Participant Schema & Model
const participantSchema = new mongoose.Schema({
  name: String,
  age: Number,
  phone: String,
  email: String,
  bloodgroup: String,
  address: String,
  lisencenumber: String,
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // Reference to the Event
});
const Participant = mongoose.model("Participant", participantSchema);

// --- Event Routes (unchanged) ---
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Error saving event:", error.message);
    res.status(400).json({ error: "Failed to save event." });
  }
});

app.put("/api/events/:id", async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event." });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event." });
  }
});

// --- Participant Routes ---
app.get("/api/participants/event/:eventId", async (req, res) => {
  try {
    const participants = await Participant.find({ eventId: req.params.eventId });
    res.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ error: "Failed to fetch participants" });
  }
});

app.post("/api/participants", async (req, res) => {
  try {
    const { lisencenumber, eventId } = req.body;

    // Check if participant already registered for the specific event
    const existing = await Participant.findOne({ lisencenumber, eventId });
    if (existing) {
      return res.status(400).json({ message: "Participant already registered for this event." });
    }

    // Register new participant
    const newParticipant = new Participant(req.body);
    await newParticipant.save();
    res.status(201).json({ message: "Participant registered successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Fetch participants for a specific event (optional for frontend validation)
app.get("/api/participants", async (req, res) => {
  try {
    const { eventId } = req.query; // Assuming eventId is passed as a query parameter
    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required." });
    }

    const participants = await Participant.find({ eventId });
    res.json(participants);
  } catch (err) {
    res.status(500).json({ message: "Error fetching participants" });
  }
});


// --- File Upload Configuration (using multer) ---
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });

app.post("/api/participants/upload", upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const eventId = req.body.eventId;
  const results = [];

  if (req.file.mimetype === 'text/csv') {
    // Handle CSV file
    const buffer = req.file.buffer.toString('utf8');
    const stream = require('stream');
    const bufferStream = stream.Readable.from(buffer);

    bufferStream
      .pipe(csv())
      .on('data', (data) => {
        // Assuming your CSV headers match the Participant schema (name, age, phone, email)
        const participantData = { ...data, eventId };
        results.push(participantData);
      })
      .on('end', async () => {
        try {
          const insertedParticipants = await Participant.insertMany(results);
          res.status(201).json({ message: 'Participants uploaded successfully', data: insertedParticipants });
        } catch (error) {
          console.error("Error inserting participants from CSV:", error);
          res.status(500).json({ error: "Failed to upload participants from CSV." });
        }
      })
      .on('error', (error) => {
        console.error("Error parsing CSV:", error);
        res.status(400).json({ error: "Failed to parse CSV file." });
      });
  } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || req.file.mimetype === 'application/vnd.ms-excel') {
    // Handle Excel file (requires 'xlsx' library)
    try {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);

      const participantsToInsert = jsonData.map(row => ({ ...row, eventId }));
      const insertedParticipants = await Participant.insertMany(participantsToInsert);
      res.status(201).json({ message: 'Participants uploaded successfully', data: insertedParticipants });

    } catch (error) {
      console.error("Error processing Excel file:", error);
      res.status(400).json({ error: "Failed to process Excel file." });
    }
  } else {
    return res.status(400).json({ error: "Unsupported file format. Please upload CSV or Excel." });
  }
});

// Winner Routes (These remain unchanged as they are on a different path)
app.get("/api/winners", async (req, res) => {
  const winners = await Winner.find();
  res.json(winners);
});

app.post("/api/winners", async (req, res) => {
  const newWinner = new Winner(req.body);
  await newWinner.save();
  res.json(newWinner);
});

app.put("/api/winners/:id", async (req, res) => {
  const updated = await Winner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete("/api/winners/:id", async (req, res) => {
  await Winner.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// In your server.js

app.get("/api/participants/event/name/:eventName", async (req, res) => {
  const { eventName } = req.params;
  try {
      // Assuming you have an 'Event' model and participants have an 'eventId'
      const event = await Event.findOne({ name: eventName });
      if (!event) {
          return res.status(404).json({ error: "Event not found" });
      }
      const participants = await Participant.find({ eventId: event._id });
      res.json(participants);
  } catch (error) {
      console.error("Error fetching participants by event name:", error);
      res.status(500).json({ error: "Failed to fetch participants" });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));