import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { useState } from "react";
import axiosInstance from "@/config/axiosInstance";
import { toast } from "react-toastify"; // Ensure you import toast for notifications

// Emitter
import emitter from "../../../../util/emitter.js";

export default function App() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [billType, setBillType] = useState(""); // Default selected value (empty)

  // Call backend API to create the bill
  const handleCreateBill = async () => {
    if (!billType) {
      toast.error("Please select a bill type!");
      return; // Ensure billType is selected before proceeding
    }

    try {
      const response = await axiosInstance.post(
        "api/cashbills/createCashBill",
        {
          status: "Pending",
          billType: billType,
        }
      );

      console.log(response.data);

      if (response.status === 201) {
        toast.success("Bill created successfully!");
        onOpenChange(false); // Close modal on success
        emitter.emit("CashBillCreated");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error creating bill!");
    }
  };

  const handleBillTypeChange = (event) => {
    setBillType(event.target.value); // Update state with selected value
  };

  return (
    <>
      <Button
        onPress={onOpen}
        size="lg"
        className="bg-black text-white font-f1 absolute top-0 right-0 m-4"
      >
        NEW CASH BILL +
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="font-f1">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 font-f1">
                Select Bill Type
              </ModalHeader>
              <ModalBody>
                <p>Please select the bill type:</p>
                {/* Native HTML Dropdown for selecting bill type */}
                <select
                  value={billType}
                  onChange={handleBillTypeChange}
                  className="w-full p-2 border rounded font-f1"
                >
                  <option value="">Select Bill Type</option>
                  <option value="E-Bill">E-Bill</option>
                  <option value="I-Bill">I-Bill</option>
                </select>
                <p>Selected Bill Type: {billType || "None selected"}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="ghost" onPress={onClose}>
                  Close
                </Button>
                <Button className="bg-black text-white" onPress={handleCreateBill}>
                  Create Bill
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
