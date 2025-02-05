import * as React from "react"
import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  TrendingUp,
  BarChart2,
  RefreshCcw,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  Menu,
  ArrowDownUp,
} from "lucide-react"

interface ForceRebalanceButtonProps {
  onClick?: () => void
  className?: string
}

function ForceRebalanceButton({ onClick, className }: ForceRebalanceButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors ${className}`}
    >
      Force Rebalance
    </Button>
  )
}

type Order = {
  id: string
  type: "Entry" | "Exit"
  status: "Pending" | "Working" | "Filled" | "Cancelled"
  symbol: string
  qty: number
}

type Strategy = {
  id: string
  firm: string
  accountNumber: string
  tradeSymbol: string
  tradeQty: number
  isActive: boolean
  capitalAllocation: number
  allocationValue: string
  preset: "Bearish" | "Cautious" | "Neutral" | "Bullish" | "Super Bullish"
  orders: Order[]
}

type StrategyType = {
  name: string
  icon: React.ReactNode
  strategies: Strategy[]
}

type BrokerageConnection = {
  id: string
  firm: string
  username: string
  accountNumber: string
  status: "Connected" | "Disconnected"
}

const availableBrokerages = ["Tastytrade"]
const presetOptions = ["Bearish", "Cautious", "Neutral", "Bullish", "Super Bullish"] as const

const initialNewStrategy: Strategy = {
  id: "",
  firm: "",
  accountNumber: "",
  tradeSymbol: "",
  tradeQty: 0,
  isActive: false,
  capitalAllocation: 0,
  allocationValue: "$0",
  preset: "Neutral",
  orders: [],
}

export default function TradingDashboard() {
  const [strategyTypes, setStrategyTypes] = useState<StrategyType[]>([
    {
      name: "IVL Automated",
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      strategies: [
        {
          id: "1",
          firm: "Tastytrade",
          accountNumber: "12345",
          tradeSymbol: "AAPL",
          tradeQty: 100,
          isActive: true,
          capitalAllocation: 10000,
          allocationValue: "$10,000",
          preset: "Neutral",
          orders: [
            { id: "1", type: "Entry", status: "Filled", symbol: "AAPL", qty: 50 },
            { id: "2", type: "Exit", status: "Working", symbol: "AAPL", qty: 25 },
          ],
        },
      ],
    },
    {
      name: "SDTE",
      icon: <BarChart2 className="h-5 w-5 text-blue-500" />,
      strategies: [
        {
          id: "6",
          firm: "Tastytrade",
          accountNumber: "67890",
          tradeSymbol: "QQQ",
          tradeQty: 100,
          isActive: true,
          capitalAllocation: 15000,
          allocationValue: "$15,000",
          preset: "Bullish",
          orders: [],
        },
      ],
    },
    {
      name: "Diagonal Hedge",
      icon: <ArrowDownUp className="h-5 w-5 text-purple-500" />,
      strategies: [
        {
          id: "8",
          firm: "Tastytrade",
          accountNumber: "89012",
          tradeSymbol: "/ES",
          tradeQty: 1,
          isActive: false,
          capitalAllocation: 40000,
          allocationValue: "$40,000",
          preset: "Bullish",
          orders: [],
        },
      ],
    },
  ])

  const [newStrategy, setNewStrategy] = useState<Strategy>(initialNewStrategy)
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null)
  const [currentStrategyType, setCurrentStrategyType] = useState<string>("")
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [activeSection, setActiveSection] = useState<"ivl" | "sdte" | "diagonal" | "brokerage">("ivl")
  const [currentAllocation, setCurrentAllocation] = useState("$80,715")
  const [nextEntryAllocation, setNextEntryAllocation] = useState("$0")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [brokerageConnections, setBrokerageConnections] = useState<BrokerageConnection[]>([
    { id: "1", firm: "Tastytrade", username: "trader1", accountNumber: "12345", status: "Connected" },
  ])

  const [newBrokerageConnection, setNewBrokerageConnection] = useState<
    Omit<BrokerageConnection, "id" | "status"> & { password: string }
  >({
    firm: "",
    username: "",
    password: "",
    accountNumber: "",
  })

  const renderStrategyDialog = useCallback(
    (type: StrategyType) => {
      const isDiagonalHedge = type.name === "Diagonal Hedge"

      return (
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brokerage" className="text-right text-gray-400">
              Brokerage
            </Label>
            <Select value={newStrategy.firm} onValueChange={(value) => setNewStrategy({ ...newStrategy, firm: value })}>
              <SelectTrigger className="col-span-3 bg-white text-black">
                <SelectValue placeholder="Select a brokerage" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black">
                {availableBrokerages.map((brokerage) => (
                  <SelectItem key={brokerage} value={brokerage} className="hover:bg-gray-200">
                    {brokerage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="accountNumber" className="text-right text-gray-400">
              Account #
            </Label>
            <Input
              id="accountNumber"
              value={newStrategy.accountNumber}
              onChange={(e) => setNewStrategy({ ...newStrategy, accountNumber: e.target.value })}
              className="col-span-3 bg-[#0a0d14] border-blue-900/40 text-gray-300"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tradeSymbol" className="text-right text-gray-400">
              Trade Symbol
            </Label>
            <Input
              id="tradeSymbol"
              value={newStrategy.tradeSymbol}
              onChange={(e) => setNewStrategy({ ...newStrategy, tradeSymbol: e.target.value })}
              className="col-span-3 bg-[#0a0d14] border-blue-900/40 text-gray-300"
            />
          </div>
          {isDiagonalHedge ? (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="allocationValue" className="text-right text-gray-400">
                  Allocation Value
                </Label>
                <Input
                  id="allocationValue"
                  value={newStrategy.allocationValue}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, "")
                    setNewStrategy({
                      ...newStrategy,
                      allocationValue: value ? `$${Number.parseInt(value).toLocaleString()}` : "$0",
                    })
                  }}
                  className="col-span-3 bg-[#0a0d14] border-blue-900/40 text-gray-300"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="preset" className="text-right text-gray-400">
                  Preset
                </Label>
                <Select
                  value={newStrategy.preset}
                  onValueChange={(value) =>
                    setNewStrategy({
                      ...newStrategy,
                      preset: value as Strategy["preset"],
                    })
                  }
                >
                  <SelectTrigger className="col-span-3 bg-white text-black">
                    <SelectValue placeholder="Select a preset" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black">
                    {presetOptions.map((preset) => (
                      <SelectItem key={preset} value={preset} className="hover:bg-gray-200">
                        {preset}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tradeQty" className="text-right text-gray-400">
                Trade Qty
              </Label>
              <Input
                id="tradeQty"
                type="number"
                value={newStrategy.tradeQty}
                onChange={(e) => setNewStrategy({ ...newStrategy, tradeQty: Number.parseInt(e.target.value) || 0 })}
                className="col-span-3 bg-[#0a0d14] border-blue-900/40 text-gray-300"
              />
            </div>
          )}
          {type.name === "IVL Automated" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capitalAllocation" className="text-right text-gray-400">
                Capital Allocation
              </Label>
              <Input
                id="capitalAllocation"
                type="number"
                value={newStrategy.capitalAllocation}
                onChange={(e) =>
                  setNewStrategy({ ...newStrategy, capitalAllocation: Number.parseFloat(e.target.value) || 0 })
                }
                className="col-span-3 bg-[#0a0d14] border-blue-900/40 text-gray-300"
              />
            </div>
          )}
        </div>
      )
    },
    [newStrategy],
  )

  const addStrategy = useCallback(() => {
    if (currentStrategyType) {
      setStrategyTypes((prevTypes) =>
        prevTypes.map((type) =>
          type.name === currentStrategyType
            ? { ...type, strategies: [...type.strategies, { ...newStrategy, id: Date.now().toString() }] }
            : type,
        ),
      )
      setNewStrategy(initialNewStrategy)
      setCurrentStrategyType("")
    }
  }, [currentStrategyType, newStrategy])

  const toggleStrategyStatus = useCallback(
    (typeName: string, strategyId: string) => {
      setStrategyTypes((prevTypes) =>
        prevTypes.map((type) =>
          type.name === typeName
            ? {
                ...type,
                strategies: type.strategies.map((strategy) =>
                  strategy.id === strategyId ? { ...strategy, isActive: !strategy.isActive } : strategy,
                ),
              }
            : type,
        ),
      )
    },
    [setStrategyTypes],
  )

  const removeStrategy = useCallback(
    (typeName: string, strategyId: string) => {
      setStrategyTypes((prevTypes) =>
        prevTypes.map((type) =>
          type.name === typeName
            ? {
                ...type,
                strategies: type.strategies.filter((strategy) => strategy.id !== strategyId),
              }
            : type,
        ),
      )
    },
    [setStrategyTypes],
  )

  const startEditing = useCallback((strategy: Strategy) => {
    setEditingStrategy(strategy)
  }, [])

  const saveEdit = useCallback(
    (typeName: string) => {
      if (editingStrategy) {
        setStrategyTypes((prevTypes) =>
          prevTypes.map((type) =>
            type.name === typeName
              ? {
                  ...type,
                  strategies: type.strategies.map((strategy) =>
                    strategy.id === editingStrategy.id ? editingStrategy : strategy,
                  ),
                }
              : type,
          ),
        )
        setEditingStrategy(null)
      }
    },
    [editingStrategy, setStrategyTypes],
  )

  const toggleRowExpansion = useCallback((strategyId: string) => {
    setExpandedRows((prev) => ({ ...prev, [strategyId]: !prev[strategyId] }))
  }, [])

  const addBrokerageConnection = useCallback(() => {
    setBrokerageConnections((prev) => [
      ...prev,
      { ...newBrokerageConnection, id: Date.now().toString(), status: "Disconnected" },
    ])
    setNewBrokerageConnection({ firm: "", username: "", password: "", accountNumber: "" })
  }, [newBrokerageConnection, setBrokerageConnections])

  const removeBrokerageConnection = useCallback(
    (id: string) => {
      setBrokerageConnections((prev) => prev.filter((conn) => conn.id !== id))
    },
    [setBrokerageConnections],
  )

  const renderStrategyCard = useCallback(
    (type: StrategyType) => (
      <Card className="bg-[#1a1f2c] border-blue-900/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl flex items-center text-gray-200">
              {type.icon}
              <span className="ml-2">{type.name}</span>
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStrategyType(type.name)}
                  className="border-blue-900/40 hover:bg-blue-900/20"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Strategy
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1f2c] border-blue-900/20">
                <DialogHeader>
                  <DialogTitle className="text-gray-200">Add New Strategy</DialogTitle>
                </DialogHeader>
                {renderStrategyDialog(type)}
                <DialogTrigger asChild>
                  <Button onClick={addStrategy} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
                    Add Strategy
                  </Button>
                </DialogTrigger>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-blue-900/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-blue-900/20 hover:bg-blue-900/10">
                  <TableHead className="text-gray-400"></TableHead>
                  <TableHead className="text-gray-400">Brokerage</TableHead>
                  <TableHead className="text-gray-400">Account #</TableHead>
                  <TableHead className="text-gray-400">Trade Symbol</TableHead>
                  {type.name !== "Diagonal Hedge" && <TableHead className="text-gray-400">Trade Qty</TableHead>}
                  {type.name === "Diagonal Hedge" && (
                    <>
                      <TableHead className="text-gray-400">Allocation Value</TableHead>
                      <TableHead className="text-gray-400">Preset</TableHead>
                    </>
                  )}
                  {type.name === "IVL Automated" && <TableHead className="text-gray-400">Capital Allocation</TableHead>}
                  <TableHead className="text-gray-400">Status</TableHead>
                  {type.name === "Diagonal Hedge" && <TableHead className="text-gray-400">Force Rebalance</TableHead>}
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {type.strategies.map((strategy) => (
                  <React.Fragment key={strategy.id}>
                    <TableRow className="hover:bg-blue-900/10">
                      <TableCell>
                        {(type.name === "IVL Automated" || type.name === "Diagonal Hedge") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(strategy.id)}
                            className="hover:bg-blue-900/20"
                          >
                            {expandedRows[strategy.id] ? (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {editingStrategy?.id === strategy.id ? (
                          <Input
                            value={editingStrategy.firm}
                            onChange={(e) => setEditingStrategy({ ...editingStrategy, firm: e.target.value })}
                            className="bg-[#0a0d14] border-blue-900/40 text-gray-300"
                          />
                        ) : (
                          strategy.firm
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {editingStrategy?.id === strategy.id ? (
                          <Input
                            value={editingStrategy.accountNumber}
                            onChange={(e) => setEditingStrategy({ ...editingStrategy, accountNumber: e.target.value })}
                            className="bg-[#0a0d14] border-blue-900/40 text-gray-300"
                          />
                        ) : (
                          strategy.accountNumber
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {editingStrategy?.id === strategy.id ? (
                          <Input
                            value={editingStrategy.tradeSymbol}
                            onChange={(e) => setEditingStrategy({ ...editingStrategy, tradeSymbol: e.target.value })}
                            className="bg-[#0a0d14] border-blue-900/40 text-gray-300"
                          />
                        ) : (
                          strategy.tradeSymbol
                        )}
                      </TableCell>
                      {type.name !== "Diagonal Hedge" && (
                        <TableCell className="text-gray-300">
                          {editingStrategy?.id === strategy.id ? (
                            <Input
                              type="number"
                              value={editingStrategy.tradeQty}
                              onChange={(e) =>
                                setEditingStrategy({
                                  ...editingStrategy,
                                  tradeQty: Number.parseInt(e.target.value) || 0,
                                })
                              }
                              className="bg-[#0a0d14] border-blue-900/40 text-gray-300"
                            />
                          ) : (
                            strategy.tradeQty
                          )}
                        </TableCell>
                      )}
                      {type.name === "Diagonal Hedge" && (
                        <>
                          <TableCell className="text-gray-300">
                            {editingStrategy?.id === strategy.id ? (
                              <Input
                                value={editingStrategy.allocationValue}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^\d]/g, "")
                                  setEditingStrategy({
                                    ...editingStrategy,
                                    allocationValue: value ? `$${Number.parseInt(value).toLocaleString()}` : "$0",
                                  })
                                }}
                                className="bg-[#0a0d14] border-blue-900/40 text-gray-300"
                              />
                            ) : (
                              strategy.allocationValue
                            )}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {editingStrategy?.id === strategy.id ? (
                              <Select
                                value={editingStrategy.preset}
                                onValueChange={(value) =>
                                  setEditingStrategy({
                                    ...editingStrategy,
                                    preset: value as Strategy["preset"],
                                  })
                                }
                              >
                                <SelectTrigger className="bg-white text-black border-blue-900/40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  {presetOptions.map((preset) => (
                                    <SelectItem key={preset} value={preset} className="text-black hover:bg-gray-200">
                                      {preset}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              strategy.preset
                            )}
                          </TableCell>
                        </>
                      )}
                      {type.name === "IVL Automated" && (
                        <TableCell className="text-gray-300">
                          {editingStrategy?.id === strategy.id ? (
                            <Input
                              type="number"
                              value={editingStrategy.capitalAllocation}
                              onChange={(e) =>
                                setEditingStrategy({
                                  ...editingStrategy,
                                  capitalAllocation: Number.parseFloat(e.target.value) || 0,
                                })
                              }
                              className="bg-[#0a0d14] border-blue-900/40 text-gray-300"
                            />
                          ) : (
                            `$${strategy.capitalAllocation.toLocaleString()}`
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge
                          variant={strategy.isActive ? "default" : "secondary"}
                          className={
                            strategy.isActive
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                          }
                        >
                          {strategy.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      {type.name === "Diagonal Hedge" && (
                        <TableCell>
                          <ForceRebalanceButton
                            onClick={() => console.log("Force rebalance clicked for strategy:", strategy.id)}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleStrategyStatus(type.name, strategy.id)}
                            className="border-blue-900/40 hover:bg-blue-900/20"
                          >
                            {strategy.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          {editingStrategy?.id === strategy.id ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => saveEdit(type.name)}
                              className="border-blue-900/40 hover:bg-blue-900/20"
                            >
                              Save
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(strategy)}
                              className="border-blue-900/40 hover:bg-blue-900/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {!strategy.isActive && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeStrategy(type.name, strategy.id)}
                              className="border-blue-900/40 hover:bg-blue-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {(type.name === "IVL Automated" || type.name === "Diagonal Hedge") && expandedRows[strategy.id] && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={type.name === "Diagonal Hedge" ? 10 : 9} className="p-0">
                          <div className="border-t border-blue-900/20 bg-[#141822]">
                            {type.name === "IVL Automated" && (
                              <>
                                <div className="p-4 border-b border-blue-900/20">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <div>
                                        <div className="text-sm text-gray-400">
                                          Current Strategy Capital Allocation:
                                        </div>
                                        <Input
                                          value={currentAllocation}
                                          onChange={(e) => setCurrentAllocation(e.target.value)}
                                          className="w-32 bg-[#0a0d14] border-blue-900/40 text-gray-300"
                                        />
                                      </div>
                                      <div>
                                        <div className="text-sm text-gray-400">Next Entry's Capital Allocation:</div>
                                        <div className="flex items-center space-x-2">
                                          <Input
                                            value={nextEntryAllocation}
                                            onChange={(e) => setNextEntryAllocation(e.target.value)}
                                            className="w-32 bg-[#0a0d14] border-blue-900/40 text-gray-300"
                                          />
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-blue-900/40 hover:bg-blue-900/20"
                                            onClick={() =>
                                              console.log("Updating next entry allocation to:", nextEntryAllocation)
                                            }
                                          >
                                            Update
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                      <div className="flex items-center space-x-2 bg-[#1a1f2c] px-3 py-2 rounded-lg">
                                        <Checkbox
                                          id="closing"
                                          className="border-white data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 bg-white"
                                        />
                                        <Label htmlFor="closing" className="text-sm text-gray-300">
                                          Closing Only
                                        </Label>
                                      </div>
                                      <Button
                                        variant="destructive"
                                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                      >
                                        Close Position
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="border-blue-900/20 hover:bg-blue-900/10">
                                      <TableHead className="text-gray-400">Order #</TableHead>
                                      <TableHead className="text-gray-400">Type</TableHead>
                                      <TableHead className="text-gray-400">Status</TableHead>
                                      <TableHead className="text-gray-400">Symbol</TableHead>
                                      <TableHead className="text-gray-400">Qty</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {strategy.orders.map((order) => (
                                      <TableRow key={order.id} className="border-blue-900/20 hover:bg-blue-900/10">
                                        <TableCell className="text-gray-300">{order.id}</TableCell>
                                        <TableCell className="text-gray-300">{order.type}</TableCell>
                                        <TableCell className="text-gray-300">
                                          <Badge
                                            variant="outline"
                                            className={
                                              order.status === "Filled"
                                                ? "border-green-500 text-green-400"
                                                : order.status === "Working"
                                                  ? "border-blue-500 text-blue-400"
                                                  : order.status === "Pending"
                                                    ? "border-yellow-500 text-yellow-400"
                                                    : "border-gray-500 text-gray-400"
                                            }
                                          >
                                            {order.status}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-300">{order.symbol}</TableCell>
                                        <TableCell className="text-gray-300">{order.qty}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </>
                            )}
                            {type.name === "Diagonal Hedge" && (
                              <div className="border-t border-blue-900/20 bg-[#141822]">
                                <div className="p-4 border-b border-blue-900/20">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-200">Current Position</h3>
                                    <div className="flex items-center gap-4">
                                      <span className="text-gray-400">Bot State</span>
                                      <Badge variant="outline" className="border-blue-500 text-blue-400">
                                        In Position
                                      </Badge>
                                      <Button
                                        variant="destructive"
                                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                      >
                                        Close Position
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow className="border-blue-900/20 hover:bg-blue-900/10">
                                      <TableHead className="text-gray-400">Symbol</TableHead>
                                      <TableHead className="text-gray-400">Qty</TableHead>
                                      <TableHead className="text-gray-400">DTE</TableHead>
                                      <TableHead className="text-gray-400">Avg Trade Price</TableHead>
                                      <TableHead className="text-gray-400">Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    <TableRow className="border-blue-900/20 hover:bg-blue-900/10">
                                      <TableCell className="text-gray-300">/ESM5 EW3H5 250321P5350</TableCell>
                                      <TableCell className="text-gray-300">-6</TableCell>
                                      <TableCell className="text-gray-300">45</TableCell>
                                      <TableCell className="text-gray-300">13.75</TableCell>
                                      <TableCell className="text-gray-300">
                                        <Badge variant="outline" className="border-green-500 text-green-400">
                                          Filled
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                    <TableRow className="border-blue-900/20 hover:bg-blue-900/10">
                                      <TableCell className="text-gray-300">/ESM5 EW3H5 250321P5150</TableCell>
                                      <TableCell className="text-gray-300">4</TableCell>
                                      <TableCell className="text-gray-300">129</TableCell>
                                      <TableCell className="text-gray-300">42.75</TableCell>
                                      <TableCell className="text-gray-300">
                                        <Badge variant="outline" className="border-green-500 text-green-400">
                                          Filled
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    ),
    [
      addStrategy,
      currentAllocation,
      editingStrategy,
      expandedRows,
      nextEntryAllocation,
      removeStrategy,
      renderStrategyDialog,
      saveEdit,
      startEditing,
      toggleRowExpansion,
      toggleStrategyStatus,
    ],
  )

  return (
    <div className="h-screen w-screen bg-[#0a0d14] text-white flex overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a1f2c]rounded-lg border border-blue-900/20top-4 left-4 z-50 p-2 bg-[#1a1f2c] rounded-lg border border-blue-900/20"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="h-5 w-5 text-gray-400" />
      </button>

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-[#1a1f2c] border-r border-blue-900/20
        transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <div className="p-4 space-y-4">
          {/* Brokerage Link */}
          <button
            onClick={() => setActiveSection("brokerage")}
            className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeSection === "brokerage" ? "bg-blue-900/20 text-blue-400" : "text-gray-400 hover:bg-blue-900/10"
            }`}
          >
            <RefreshCcw className="h-5 w-5" />
            <span>Brokerage</span>
          </button>

          {/* Strategies Section */}
          <div>
            <h2 className="px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Strategies</h2>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => setActiveSection("ivl")}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  activeSection === "ivl" ? "bg-blue-900/20 text-blue-400" : "text-gray-400 hover:bg-blue-900/10"
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                <span>IVL Automated</span>
              </button>
              <button
                onClick={() => setActiveSection("sdte")}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  activeSection === "sdte" ? "bg-blue-900/20 text-blue-400" : "text-gray-400 hover:bg-blue-900/10"
                }`}
              >
                <BarChart2 className="h-5 w-5" />
                <span>SDTE</span>
              </button>
              <button
                onClick={() => setActiveSection("diagonal")}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  activeSection === "diagonal" ? "bg-blue-900/20 text-blue-400" : "text-gray-400 hover:bg-blue-900/10"
                }`}
              >
                <ArrowDownUp className="h-5 w-5" />
                <span>Diagonal Hedge</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-[#1a1f2c] border-b border-blue-900/20">
          <h1 className="text-xl font-bold text-gray-200">
            {activeSection === "ivl" && "IVL Automated"}
            {activeSection === "sdte" && "SDTE"}
            {activeSection === "diagonal" && "Diagonal Hedge"}
            {activeSection === "brokerage" && "Brokerage Connections"}
          </h1>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activeSection === "ivl" && renderStrategyCard(strategyTypes[0])}
            {activeSection === "sdte" && renderStrategyCard(strategyTypes[1])}
            {activeSection === "diagonal" && renderStrategyCard(strategyTypes[2])}
            {activeSection === "brokerage" && (
              <Card className="bg-[#1a1f2c] border-blue-900/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl text-gray-200">Brokerage Connections</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-blue-900/40 hover:bg-blue-900/20">
                          <Plus className="mr-2 h-4 w-4" /> Add Connection
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#1a1f2c] border-blue-900/20">
                        <DialogHeader>
                          <DialogTitle className="text-gray-200">Add New Brokerage Connection</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="firm" className="text-right text-gray-400">
                              Firm
                            </Label>
                            <Select
                              onValueChange={(value) =>
                                setNewBrokerageConnection({ ...newBrokerageConnection, firm: value })
                              }
                            >
                              <SelectTrigger className="col-span-3 bg-white text-black">
                                <SelectValue placeholder="Select a brokerage firm" />
                              </SelectTrigger>
                              <SelectContent className="bg-white text-black">
                                {availableBrokerages.map((brokerage) => (
                                  <SelectItem key={brokerage} value={brokerage} className="hover:bg-gray-200">
                                    {brokerage}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right text-gray-400">
                              Username
                            </Label>
                            <Input
                              id="username"
                              value={newBrokerageConnection.username}
                              onChange={(e) =>
                                setNewBrokerageConnection({ ...newBrokerageConnection, username: e.target.value })
                              }
                              className="col-span-3 bg-[#0a0d14] border-blue-900/40 text-gray-300"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="accountNumber" className="text-right text-gray-400">
                              Account #
                            </Label>
                            <Input
                              id="accountNumber"
                              value={newBrokerageConnection.accountNumber}
                              onChange={(e) =>
                                setNewBrokerageConnection({ ...newBrokerageConnection, accountNumber: e.target.value })
                              }
                              className="col-span-3 bg-[#0a0d14] border-blue-900/40 text-gray-300"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right text-gray-400">
                              Password
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              value={newBrokerageConnection.password}
                              onChange={(e) =>
                                setNewBrokerageConnection({ ...newBrokerageConnection, password: e.target.value })
                              }
                              className="col-span-3 bg-[#0a0d14] border-blue-900/40 text-gray-300"
                            />
                          </div>
                        </div>
                        <DialogTrigger asChild>
                          <Button
                            onClick={addBrokerageConnection}
                            className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                          >
                            Add Connection
                          </Button>
                        </DialogTrigger>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-blue-900/20 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-blue-900/20 hover:bg-blue-900/10">
                          <TableHead className="text-gray-400">Firm</TableHead>
                          <TableHead className="text-gray-400">Username</TableHead>
                          <TableHead className="text-gray-400">Account #</TableHead>
                          <TableHead className="text-gray-400">Status</TableHead>
                          <TableHead className="text-gray-400">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {brokerageConnections.map((connection) => (
                          <TableRow key={connection.id} className="border-blue-900/20 hover:bg-blue-900/10">
                            <TableCell className="text-gray-300">{connection.firm}</TableCell>
                            <TableCell className="text-gray-300">{connection.username}</TableCell>
                            <TableCell className="text-gray-300">{connection.accountNumber}</TableCell>
                            <TableCell>
                              <Badge
                                variant={connection.status === "Connected" ? "default" : "secondary"}
                                className={
                                  connection.status === "Connected"
                                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                    : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                                }
                              >
                                {connection.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeBrokerageConnection(connection.id)}
                                  className="border-blue-900/40 hover:bg-blue-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

