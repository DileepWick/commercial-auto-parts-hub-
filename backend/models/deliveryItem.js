import mongoose from 'mongoose';

const deliveryItemSchema = new mongoose.Schema({
  item: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    refPath: 'itemType' // Dynamically references different schemas based on 'itemType'
  },
  stock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: true
  },
  itemType: { 
    type: String, 
    required: true 
  },
  delivery_quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  received_quantity: { 
    type: Number, 
    default: 0 
  },
  returned_quantity: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Received', 'Count mismatch','Returned'], 
    default: 'Pending', 
    required: true 
  },
  markedBy: { 
    type: String, 
    default: 'Not Marked',  // Set default value as 'Staff'
  },
  deliveryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Delivery', // Reference to the Delivery model
    required: true 
  }
}, {
  timestamps: true
});

// Middleware to set 'markedBy' to 'Staff' when status changes to 'Received'
deliveryItemSchema.pre('save', function (next) {
  if (this.status === 'Received') {
    this.markedBy = 'Staff'; // Hardcode to "Staff" when status is "Received"
  }
  next();
});

const DeliveryItem = mongoose.model('DeliveryItem', deliveryItemSchema);

export default DeliveryItem;
