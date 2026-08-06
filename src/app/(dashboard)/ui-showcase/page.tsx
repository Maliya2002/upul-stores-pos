"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  PageHeader,
  MetricCard,
  CurrencyDisplay,
  StatusBadge,
  FilterBar,
  ExportButton,
  PrintButton,
  DatePicker,
  QuickStatsBar,
  ActivityFeed,
  KeyboardShortcutsHelp,
} from "@/components/ui-custom";
import { DataTable } from "@/components/tables";
import { SalesOverviewChart } from "@/components/charts";
import { FormSection, FileUpload, ImageUpload } from "@/components/forms";
import { BaseModal, ConfirmDialog } from "@/components/modals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
};

const productData: ProductRow[] = [
  {
    id: "P001",
    name: "Milo 400g",
    category: "Beverages",
    price: 900,
    stock: 42,
    status: "active",
  },
  {
    id: "P002",
    name: "Anchor Milk 1L",
    category: "Dairy",
    price: 550,
    stock: 15,
    status: "active",
  },
  {
    id: "P003",
    name: "Sunlight Soap",
    category: "Household",
    price: 150,
    stock: 6,
    status: "low_stock",
  },
  {
    id: "P004",
    name: "Dettol 250ml",
    category: "Health",
    price: 600,
    stock: 0,
    status: "out_of_stock",
  },
  {
    id: "P005",
    name: "Red Rice 5kg",
    category: "Groceries",
    price: 2500,
    stock: 28,
    status: "active",
  },
  {
    id: "P006",
    name: "Tea 200g",
    category: "Beverages",
    price: 480,
    stock: 4,
    status: "low_stock",
  },
];

const chartData = [
  { name: "Mon", sales: 12000, orders: 22 },
  { name: "Tue", sales: 18000, orders: 31 },
  { name: "Wed", sales: 16000, orders: 27 },
  { name: "Thu", sales: 24000, orders: 40 },
  { name: "Fri", sales: 21000, orders: 35 },
  { name: "Sat", sales: 28000, orders: 48 },
  { name: "Sun", sales: 19000, orders: 30 },
];

const activityItems = [
  {
    id: 1,
    title: "New sale completed",
    description: "Invoice #INV-1023 completed successfully.",
    time: "2 min ago",
    type: "success" as const,
  },
  {
    id: 2,
    title: "Low stock alert",
    description: "Tea 200g is below minimum stock level.",
    time: "15 min ago",
    type: "warning" as const,
  },
  {
    id: 3,
    title: "Supplier payment pending",
    description: "Payment pending for ABC Suppliers.",
    time: "1 hour ago",
    type: "error" as const,
  },
];

export default function UIShowcasePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [sampleName, setSampleName] = useState("");
  const [baseModalOpen, setBaseModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const columns = useMemo<ColumnDef<ProductRow, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Product ID",
      },
      {
        accessorKey: "name",
        header: "Product Name",
      },
      {
        accessorKey: "category",
        header: "Category",
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: (info) => <CurrencyDisplay amount={info.row.original.price} />,
      },
      {
        accessorKey: "stock",
        header: "Stock",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => <StatusBadge status={info.row.original.status} />,
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="UI Showcase"
        badge="Phase 02"
        description="Reusable UI foundation components for the Upul Stores Smart POS system."
        actions={
          <>
            <PrintButton />
            <ExportButton data={productData} filename="ui-showcase-products" />
            <Button onClick={() => setBaseModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Open Modal
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Confirm Delete
            </Button>
          </>
        }
      />

      <QuickStatsBar
        items={[
          { label: "Today Sales", value: "Rs. 125,750" },
          { label: "Orders", value: "48" },
          { label: "Low Stock", value: "6 Items" },
          { label: "Customers", value: "892" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Today's Sales"
          value={<CurrencyDisplay amount={125750} />}
          icon={DollarSign}
          change={12.5}
          iconWrapperClassName="bg-blue-500/10"
          iconClassName="text-blue-500"
        />
        <MetricCard
          title="Today's Orders"
          value="48"
          icon={ShoppingCart}
          change={8.2}
          iconWrapperClassName="bg-emerald-500/10"
          iconClassName="text-emerald-500"
        />
        <MetricCard
          title="Products"
          value="1,250"
          icon={Package}
          change={5.1}
          iconWrapperClassName="bg-purple-500/10"
          iconClassName="text-purple-500"
        />
        <MetricCard
          title="Customers"
          value="892"
          icon={Users}
          change={3.8}
          iconWrapperClassName="bg-orange-500/10"
          iconClassName="text-orange-500"
        />
      </div>

      <FilterBar>
        <div className="space-y-1">
          <p className="text-sm font-medium">Reusable Toolbar Area</p>
          <p className="text-xs text-muted-foreground">
            Use this section for filters, exports, searches and quick actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DatePicker value={selectedDate} onChange={setSelectedDate} />
          <Button
            variant="outline"
            onClick={() => toast.success("Sample filter applied")}
          >
            Apply Filter
          </Button>
        </div>
      </FilterBar>

      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <SalesOverviewChart data={chartData} />
        </div>
        <div className="lg:col-span-3">
          <ActivityFeed items={activityItems} />
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Reusable Data Table</h2>
            <p className="text-sm text-muted-foreground">
              Search, filter and pagination ready TanStack table.
            </p>
          </div>

          <DataTable
            columns={columns}
            data={productData}
            searchKey="name"
            searchPlaceholder="Search products..."
            filterColumn="status"
            filterOptions={[
              { label: "Active", value: "active" },
              { label: "Low Stock", value: "low_stock" },
              { label: "Out of Stock", value: "out_of_stock" },
            ]}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <FormSection
          title="Form Foundation"
          description="Reusable form layout blocks for product/customer forms."
        >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sample-name">Sample Name</Label>
              <Input
                id="sample-name"
                placeholder="Enter sample name"
                value={sampleName}
                onChange={(e) => setSampleName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Sample Date</Label>
              <DatePicker value={selectedDate} onChange={setSelectedDate} />
            </div>

            <Button onClick={() => toast.success("Form submitted successfully")}>
              Save Sample
            </Button>
          </div>
        </FormSection>

        <KeyboardShortcutsHelp />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <FormSection
          title="File Upload"
          description="Upload invoices, documents or CSV files."
        >
          <FileUpload files={documentFiles} onFilesChange={setDocumentFiles} />
        </FormSection>

        <FormSection
          title="Image Upload"
          description="Upload product or customer images with preview."
        >
          <ImageUpload files={imageFiles} onFilesChange={setImageFiles} />
        </FormSection>
      </div>

      <BaseModal
        open={baseModalOpen}
        onOpenChange={setBaseModalOpen}
        title="Sample Modal"
        description="This is a reusable modal component for Phase 02."
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You can use this modal for creating records, viewing details or
            editing data in future phases.
          </p>
          <div className="flex justify-end">
            <Button onClick={() => setBaseModalOpen(false)}>Close</Button>
          </div>
        </div>
      </BaseModal>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => toast.success("Item deleted successfully")}
      />
    </div>
  );
}