import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Progress,
  Button,
  useDisclosure,
  Input,
} from "@nextui-org/react";

//Controller for API ENDPOINT
import axiosInstance from "@/config/axiosInstance";

//Emitter
import emitter from "../../../../util/emitter.js";

import { toast } from "react-toastify";

const ItemAddToDeliveryButton = ({
  item_id,
  delivery_id,
  stockId,
  item_description,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle form submission for new delivery item creation
  const handleSubmit = async (e) => {
    // Check if stockId is available
    if (!stockId) {
      toast.error("Stock ID not found. Please try again.");
      return;
    }

    e.preventDefault(); // Prevent the default form submission

    console.log("Props received:", { item_id, delivery_id, stockId });

    if (!quantity || isNaN(quantity) || quantity <= 0) {
      setError("Please provide a valid quantity.");
      return;
    }

    try {
      console.log("Payload being sent:", {
        item: item_id,
        quantity: quantity,
        deliveryId: delivery_id,
        stock: stockId,
      });

      setLoading(true);

      const response = await axiosInstance.post(
        "/api/deliveryItems/createDeliveryItem",
        {
          item: item_id, // Use the item_id passed as a prop
          delivery_quantity: quantity,
          deliveryId: delivery_id, // Use the delivery_id passed as a prop
          stock: stockId,
        }
      );

      // Console log the response
      console.log("Delivery item created:", response.data);

      if (response.status === 201) {
        // Decrease stock quantity only if item creation is successful
        await axiosInstance.put(
          `/api/stocks/decreaseStockQuantity/${stockId}`,
          {
            quantity: quantity,
          }
        );

        setError(""); // Clear error message if the request is successful
        setQuantity(""); // Clear the quantity field after success
        onOpenChange(false);
        toast.success("Item added to delivery successfully!");
        setLoading(false);

        // Emit the event to notify GasketList
        emitter.emit("deliveryItemCreated");
      }
    } catch (error) {
      // Catch any error during the process and log the error message
      console.error("Error creating delivery item:", error.message);
      setLoading(false);

      // Handle status code errors in the catch block
      if (error.response && error.response.status === 419) {
        toast.error("Item already exists in the delivery.");
        setError("Item already exists in the delivery.");
      } else {
        setError("Failed to add item to delivery. Please try again.");
      }
    }
  };

  // Reset form when the modal is closed
  const handleClose = () => {
    setQuantity(""); // Reset quantity
    setError(""); // Reset error message
    setSuccessMessage(""); // Reset success message
  };

  return (
    <>
      <Button onPress={onOpen} className="bg-black text-white">
        Add +
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={handleClose}
        size="lg"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 font-f1">
            Add Item to Delivery
          </ModalHeader>
          <ModalBody>
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Progress
                  isIndeterminate
                  aria-label="Loading data..."
                  className="w-full mb-4 font-f1"
                  size="sm"
                  label="Adding Item..."
                />
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <Input
                  type="number"
                  size="lg"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="font-f1"
                  label="Quantity"
                  placeholder="Enter your quantity"
                  required
                />
                {error && <p className="text-red-500">{error}</p>}
                {successMessage && (
                  <p className="text-green-500">{successMessage}</p>
                )}
                <Button
                  type="submit"
                  className="mt-8 mb-8 font-f1 bg-black text-white"
                >
                  Add Item
                </Button>
              </form>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ItemAddToDeliveryButton;
