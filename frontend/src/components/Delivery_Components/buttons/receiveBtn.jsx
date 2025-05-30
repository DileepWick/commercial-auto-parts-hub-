import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Progress,
  Input,
} from "@nextui-org/react";
import MarkAsReceive from "./markAsReceiveBtn.jsx";

// Emitter
import emitter from "../../../../util/emitter.js";

//Buttons
import CompleteDeliveryBtn from "./completeDeliveryBtn.jsx";

//Controller for API ENDPOINT
import axiosInstance from "@/config/axiosInstance";

const ReceiveBtn = ({ deliveryId }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [deliveryItems, setDeliveryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // For search query
  const [statusFilter, setStatusFilter] = useState(""); // For status filter

  // Fetch Delivery Items function
  const fetchDeliveryItems = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/deliveryItems/getDeliveryItemsByDeliveryId/${deliveryId}`
      );
      setDeliveryItems(response.data.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch delivery items.");
      console.error("Error fetching delivery items:", err.message);
    }
  };

  // Delivery Item Received Event Handler
  const handleDeliveryItemReceived = () => {
    console.log(
      "DeliveryItem Processed event received! Fetching Delivery Items..."
    );
    fetchDeliveryItems();
  };

  // Fetch Delivery Items when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDeliveryItems(); // Fetch items when the modal opens
    }

    // Subscribe to the 'deliveryItemReceived' event
    emitter.on("deliveryItemProcessed", handleDeliveryItemReceived);

    // Cleanup listener on component unmount
    return () => {
      emitter.off("deliveryItemProcessed", handleDeliveryItemReceived);
    };
  }, [isOpen, deliveryId]);

  // Calculate the progress percentage based on received items
  const receivedCount = deliveryItems.filter(
    (item) => item.status === "Received"
  ).length;
  const progress =
    deliveryItems.length === 0
      ? 0
      : (receivedCount / deliveryItems.length) * 100;

  // Filter items based on search query and status filter
  useEffect(() => {
    let filtered = deliveryItems;

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    setFilteredItems(filtered);
  }, [searchQuery, statusFilter, deliveryItems]);

  return (
    <>
      <Button onPress={onOpen} color="default" variant="ghost">
        Receive
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="full"
        className="font-f1"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3>Receive Items</h3>
              </ModalHeader>
              <ModalBody>
                {error ? (
                  <p>{error}</p>
                ) : (
                  <div
                    id="printableTable"
                    style={{
                      maxHeight: "400px",
                      overflowY: "scroll",
                      padding: "10px",
                    }}
                  >
                    <div className="flex flex-row">
                      {/* Progress Bar */}
                      <Progress
                        value={progress}
                        color="danger"
                        size="sm"
                        label={`Receive Progress (${receivedCount}/${deliveryItems.length} Received)`}
                        showValueLabel={true}
                        className="w-full"
                      ></Progress>{" "}
                    </div>

                    <div className="flex flex-row">
                      {/* Search Box */}
                      <Input
                        label="Search"
                        placeholder="Enter description"
                        size="sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-[400px] mb-8 mt-4"
                      />
                      {/* Status Filter */}
                      <div className=" mb-8 ml-8 mt-4">
                        <select
                          className="border border-gray-300 rounded-md py-2 px-4"
                          id="statusFilter"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="" className="p-4 text-black">
                            All Statuses
                          </option>
                          <option value="Received">Received</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                    </div>
                    <Table
                      aria-label="Delivery Items Table"
                      className="font-f1"
                    >
                      <TableHeader>
                        <TableColumn>Item </TableColumn>
                        <TableColumn>Delivered Quantity</TableColumn>
                        <TableColumn>Received Quantity</TableColumn>
                        <TableColumn>Returned Quantity</TableColumn>
                        <TableColumn>Sender</TableColumn>
                        <TableColumn>Receiver</TableColumn>
                        <TableColumn>Checking Status</TableColumn>
                        <TableColumn>Mark As Received</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map((item) => (
                          <TableRow key={item._id}>
                            <TableCell>
                              {item.itemType === "Gasket" ? (
                                <>
                                  {item.item.engine?.engine_name}{" "}
                                  {item.item.packing_type}{" "}
                                  {item.item.material_type}{" "}
                                  {item.item.vendor?.vendor_name}{" "}
                                  {item.itemType}
                                  <Chip
                                    color="primary"
                                    className="ml-4"
                                    variant="bordered"
                                  >
                                    {item.item.brand?.brand_name}
                                  </Chip>
                                </>
                              ) : item.itemType === "Ring" ? (
                                <>
                                  {item.item.engine?.engine_name}{" "}
                                  {item.item.sizes} {item.item.material}
                                  {item.item.vendor?.vendor_name}{" "}
                                  {item.itemType}
                                  <Chip
                                    color="primary"
                                    className="ml-4"
                                    variant="bordered"
                                  >
                                    {item.item.brand}
                                  </Chip>
                                </>
                              ) : null}
                            </TableCell>
                            <TableCell>{item.delivery_quantity}</TableCell>
                            <TableCell>{item.received_quantity}</TableCell>
                            <TableCell>{item.returned_quantity}</TableCell>
                            <TableCell>
                              {item.deliveryId.senderBranch}
                            </TableCell>
                            <TableCell>
                              {item.deliveryId.receiverBranch}
                            </TableCell>
                            <TableCell>
                              {item.status === "Received" ? (
                                <Chip className="font-f1 bg-black text-white">
                                  {item.status}
                                </Chip>
                              ) : (
                                <Chip color="danger" variant="dot">
                                  {item.status}
                                </Chip>
                              )}
                            </TableCell>
                            <TableCell>
                              {item.status === "Received" ? (
                                <span>Item Already Marked</span>
                              ) : (
                                <MarkAsReceive
                                  deliveryItemId={item._id}
                                  Item={item.item._id}
                                  quantity={item.delivery_quantity}
                                  itemId={item.item._id}
                                  itemType={item.itemType}
                                  SenderStock={item.stock._id}
                                  receivingBranch={
                                    item.deliveryId.receiverBranch
                                  }
                                  deliveryId={item.deliveryId._id}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose} color="danger" variant="bordered">
                  Close
                </Button>
                {/* Complete Delivery Button */}
                {receivedCount === deliveryItems.length && (
                  <CompleteDeliveryBtn deliveryId={deliveryId} />
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ReceiveBtn;
