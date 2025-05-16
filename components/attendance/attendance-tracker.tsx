"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Filter, Download, Plus, Edit, Trash2, Users } from "lucide-react"
import { mockAttendance } from "@/lib/mock-data"
import { useLayout } from "@/components/layout/layout-provider"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MarkAttendanceForm } from "@/components/attendance/mark-attendance-form"
import { EditAttendanceForm } from "@/components/attendance/edit-attendance-form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { BulkAttendanceForm } from "@/components/attendance/bulk-attendance-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AttendanceTracker() {
  const { attendance, addAttendance, updateAttendance, deleteAttendance, employees } = useLayout()
  const { toast } = useToast()

  const [dateRange, setDateRange] = useState<[Date | undefined, Date | undefined]>([undefined, undefined])
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  // Dialog states
  const [markAttendanceOpen, setMarkAttendanceOpen] = useState(false)
  const [bulkAttendanceOpen, setBulkAttendanceOpen] = useState(false)
  const [editAttendanceOpen, setEditAttendanceOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null)

  // Use attendance from context if available, otherwise use mock data
  const attendanceData = attendance.length > 0 ? attendance : mockAttendance

  const filteredData = attendanceData.filter((record) => {
    const matchesEmployee = selectedEmployee === "all" || record.employeeId === selectedEmployee
    const matchesStatus = selectedStatus === "all" || record.status === selectedStatus

    if (dateRange[0] && dateRange[1]) {
      const recordDate = new Date(record.date)
      const isInRange = recordDate >= dateRange[0] && recordDate <= dateRange[1]
      return matchesEmployee && matchesStatus && isInRange
    }

    return matchesEmployee && matchesStatus
  })

  const handleMarkAttendance = (data: any) => {
    const newAttendance = {
      ...data,
      id: (attendanceData.length + 1).toString(),
      date: format(selectedDate, "MMMM d, yyyy"),
    }

    addAttendance(newAttendance)
    setMarkAttendanceOpen(false)

    toast({
      title: "Attendance Marked",
      description: `Attendance for ${data.employeeName} has been recorded.`,
    })
  }

  const handleBulkAttendance = (data: any) => {
    const { selectedEmployees, date, checkIn, checkOut, status } = data

    const newRecords = selectedEmployees.map((empId: string, index: number) => {
      const employee = employees.find((e) => e.id === empId || e.employeeId === empId)

      // Calculate working hours
      let workingHours = "0"
      let checkInStatus = "on-time"
      let checkOutStatus = "on-time"

      if (checkIn && checkOut) {
        try {
          const checkInTime = new Date(`2000-01-01 ${checkIn}`)
          const checkOutTime = new Date(`2000-01-01 ${checkOut}`)

          let diff = checkOutTime.getTime() - checkInTime.getTime()
          if (diff < 0) {
            diff += 24 * 60 * 60 * 1000
          }

          const hours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100
          workingHours = hours.toString()

          // Set check-in status
          const checkInHour = checkInTime.getHours()
          const checkInMinute = checkInTime.getMinutes()
          if (checkInHour > 9 || (checkInHour === 9 && checkInMinute > 15)) {
            checkInStatus = "late"
          }

          // Set check-out status
          const checkOutHour = checkOutTime.getHours()
          const checkOutMinute = checkOutTime.getMinutes()
          if (checkOutHour < 17 || (checkOutHour === 17 && checkOutMinute < 0)) {
            checkOutStatus = "early"
          }
        } catch (error) {
          console.error("Error calculating working hours:", error)
        }
      }

      return {
        id: (attendanceData.length + index + 1).toString(),
        employeeId: employee?.employeeId || employee?.id || "",
        employeeName: employee?.name || "",
        date: format(date, "MMMM d, yyyy"),
        checkIn,
        checkOut,
        checkInStatus,
        checkOutStatus,
        workingHours,
        status,
      }
    })

    // Add all new records
    newRecords.forEach((record) => {
      addAttendance(record)
    })

    setBulkAttendanceOpen(false)

    toast({
      title: "Bulk Attendance Marked",
      description: `Attendance for ${newRecords.length} employees has been recorded.`,
    })
  }

  const handleEditAttendance = (data: any) => {
    updateAttendance(data)
    setEditAttendanceOpen(false)

    toast({
      title: "Attendance Updated",
      description: `Attendance record has been updated successfully.`,
    })
  }

  const handleDeleteAttendance = () => {
    if (selectedAttendance) {
      deleteAttendance(selectedAttendance.id)
      setDeleteDialogOpen(false)

      toast({
        title: "Attendance Deleted",
        description: `Attendance record has been deleted.`,
        variant: "destructive",
      })
    }
  }

  const handleBulkDelete = () => {
    if (selectedRecords.length > 0) {
      selectedRecords.forEach((id) => {
        deleteAttendance(id)
      })

      setSelectedRecords([])
      setSelectAll(false)

      toast({
        title: "Bulk Delete Successful",
        description: `${selectedRecords.length} attendance records have been deleted.`,
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (record: any) => {
    setSelectedAttendance(record)
    setEditAttendanceOpen(true)
  }

  const openDeleteDialog = (record: any) => {
    setSelectedAttendance(record)
    setDeleteDialogOpen(true)
  }

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Employee ID", "Employee Name", "Date", "Check In", "Check Out", "Working Hours", "Status"]
    const csvContent = [
      headers.join(","),
      ...filteredData.map((record) => {
        return [
          record.employeeId,
          record.employeeName,
          record.date,
          record.checkIn,
          record.checkOut,
          record.workingHours,
          record.status,
        ].join(",")
      }),
    ].join("\n")

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "attendance.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Successful",
      description: `${filteredData.length} attendance records exported to CSV.`,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Present":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">{status}</Badge>
      case "Absent":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">{status}</Badge>
      case "Half Day":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleSelectRecord = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRecords((prev) => [...prev, id])
    } else {
      setSelectedRecords((prev) => prev.filter((recordId) => recordId !== id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedRecords(filteredData.map((record) => record.id))
    } else {
      setSelectedRecords([])
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm p-4">
        <Tabs defaultValue="view" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="view">View Attendance</TabsTrigger>
              <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              {selectedRecords.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected ({selectedRecords.length})
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete selected attendance records</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2" onClick={exportToCSV}>
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export attendance records to CSV</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <TabsContent value="view" className="mt-0">
            <div className="flex flex-col md:flex-row gap-4 md:items-center mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-sky-600" />
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange[0] && dateRange[1]
                        ? `${format(dateRange[0], "MMM d, yyyy")} - ${format(dateRange[1], "MMM d, yyyy")}`
                        : "Select date range"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="range"
                      selected={{
                        from: dateRange[0],
                        to: dateRange[1],
                      }}
                      onSelect={(range) => {
                        setDateRange([range?.from, range?.to])
                        if (range?.from && range?.to) {
                          setCalendarOpen(false)
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-sky-600" />
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    <SelectItem value="EMP001">Sarah Johnson</SelectItem>
                    <SelectItem value="EMP002">Michael Brown</SelectItem>
                    <SelectItem value="EMP003">Emily Davis</SelectItem>
                    <SelectItem value="EMP004">David Wilson</SelectItem>
                    <SelectItem value="EMP005">Jessica Taylor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                    <SelectItem value="Half Day">Half Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mark" className="mt-0">
            <div className="flex flex-col md:flex-row gap-4 md:items-center mb-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="bg-sky-600 hover:bg-sky-700" onClick={() => setMarkAttendanceOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Mark Individual
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mark attendance for a single employee</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => setBulkAttendanceOpen(true)}>
                      <Users className="h-4 w-4 mr-2" /> Mark Bulk Attendance
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mark attendance for multiple employees at once</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label="Select all" />
                </TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Working Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRecords.includes(record.id)}
                        onCheckedChange={(checked) => handleSelectRecord(record.id, checked === true)}
                        aria-label={`Select ${record.employeeName}`}
                      />
                    </TableCell>
                    <TableCell>{record.employeeName}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-sky-600" />
                        {record.checkIn}
                        {record.checkInStatus === "late" && (
                          <Badge className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                            Late
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-sky-600" />
                        {record.checkOut}
                        {record.checkOutStatus === "early" && (
                          <Badge className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                            Early
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{record.workingHours} hrs</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-amber-600"
                                onClick={() => openEditDialog(record)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit attendance record</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
                                onClick={() => openDeleteDialog(record)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete attendance record</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Calendar className="h-10 w-10 mb-2" />
                      <p>No attendance records found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Mark Individual Attendance Dialog */}
      <Dialog open={markAttendanceOpen} onOpenChange={setMarkAttendanceOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
          </DialogHeader>
          <MarkAttendanceForm
            onSubmit={handleMarkAttendance}
            onCancel={() => setMarkAttendanceOpen(false)}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </DialogContent>
      </Dialog>

      {/* Bulk Attendance Dialog */}
      <Dialog open={bulkAttendanceOpen} onOpenChange={setBulkAttendanceOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Bulk Attendance Marking</DialogTitle>
          </DialogHeader>
          <BulkAttendanceForm onSubmit={handleBulkAttendance} onCancel={() => setBulkAttendanceOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Attendance Dialog */}
      <Dialog open={editAttendanceOpen} onOpenChange={setEditAttendanceOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
          </DialogHeader>
          {selectedAttendance && (
            <EditAttendanceForm
              attendance={selectedAttendance}
              onSubmit={handleEditAttendance}
              onCancel={() => setEditAttendanceOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this attendance record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAttendance} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
