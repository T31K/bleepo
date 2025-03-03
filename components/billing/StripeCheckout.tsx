"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const packages = [
  { price: 5, minutes: 42 },
  { price: 10, minutes: 83 },
  { price: 15, minutes: 125 },
  { price: 20, minutes: 167 },
];

export function StripeCheckout({ onClose }: { onClose: () => void }) {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (selectedPackage === null) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/phone/checkout`,
        {
          amount: selectedPackage,
        }
      );

      if (res.data.url) {
        window.location.href = res.data.url; // Redirect to Stripe checkout
      }
    } catch (error) {
      console.error("Stripe checkout error:", error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Amount</TableHead>
            <TableHead>Minutes</TableHead>
            <TableHead>Select</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map(({ price, minutes }) => (
            <TableRow key={price}>
              <TableCell>${price}</TableCell>
              <TableCell>{minutes} min</TableCell>
              <TableCell>
                <RadioGroup
                  value={selectedPackage?.toString()}
                  onValueChange={(value) => setSelectedPackage(Number(value))}
                >
                  <RadioGroupItem value={price.toString()} />
                </RadioGroup>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button
        className="w-full"
        onClick={handleCheckout}
        disabled={loading || selectedPackage === null}
      >
        {loading ? "Processing..." : "Checkout"}
      </Button>
    </div>
  );
}
