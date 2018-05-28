import mongoose from 'mongoose';

const CalendarDateModel = mongoose.model('CalendarDate', new mongoose.Schema({
  agency_key: {
    type: Number,
    required: true,
    index: true,
  },
  service_id: {
    type: String,
    required: true,
  },
  date: {
    type: Number,
    required: true,
  },
  exception_type: {
    type: Number,
    required: true,
    min: 1,
    max: 2,
  },
  holiday_name: String,
}));

export default CalendarDateModel;