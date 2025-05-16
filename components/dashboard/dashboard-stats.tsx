"use client";

import { Card } from "@/components/ui/card";
import { Users, Clock, Calendar, Briefcase } from "lucide-react";

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="shadow-sm hover:shadow-md transition-shadow p-6 card-hover-effect">
        <div className="flex flex-col">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-3">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold">Total Employees</h3>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-3xl font-bold">124</p>
            <p className="text-xs text-green-600 dark:text-green-400">
              +12 from last month
            </p>
          </div>
        </div>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow p-6 card-hover-effect">
        <div className="flex flex-col">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 mr-3">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold">Present Today</h3>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-3xl font-bold">98</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              79% attendance rate
            </p>
          </div>
        </div>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow p-6 card-hover-effect">
        <div className="flex flex-col">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30 mr-3">
              <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold">On Leave</h3>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-3xl font-bold">8</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              6% of workforce
            </p>
          </div>
        </div>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow p-6 card-hover-effect">
        <div className="flex flex-col">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-3">
              <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold">Active Projects</h3>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-3xl font-bold">16</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              3 due this week
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
