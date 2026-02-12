import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Filter, Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Timeline() {
  const [user, setUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', category: 'Academic', owner: 'Student', priority: 'Medium' });
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: tasks = [] } = useQuery({
    queryKey: ['student-tasks', user?.email],
    queryFn: () => base44.entities.Task.filter({ student_email: user?.email }, 'due_date'),
    enabled: !!user?.email
  });

  const { data: colleges = [] } = useQuery({
    queryKey: ['student-colleges', user?.email],
    queryFn: () => base44.entities.StudentCollegeList.filter({ student_email: user?.email }),
    enabled: !!user?.email
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create({ ...data, student_email: user.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-tasks'] });
      setNewTaskOpen(false);
      setTaskForm({ title: '', category: 'Academic', owner: 'Student', priority: 'Medium' });
      toast.success('Task created!');
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Task.update(id, { status, completed_at: status === 'Completed' ? new Date().toISOString() : null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-tasks'] });
    }
  });

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const categoryMatch = filterCategory === 'all' || task.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  const groupedTasks = {
    overdue: filteredTasks.filter(t => t.status !== 'Completed' && new Date(t.due_date) < new Date()),
    upcoming: filteredTasks.filter(t => t.status !== 'Completed' && new Date(t.due_date) >= new Date()),
    completed: filteredTasks.filter(t => t.status === 'Completed')
  };

  const categories = ['Academic', 'Testing', 'Essay', 'Letter of Rec', 'Activity', 'Financial Aid', 'Athletic', 'Administrative', 'Scholarship'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Timeline</h1>
          <p className="text-lg text-gray-600">{tasks.length} total tasks</p>
        </div>

        <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Task name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={taskForm.description || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Task details"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={taskForm.category} onValueChange={(v) => setTaskForm({ ...taskForm, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Due Date</label>
                <Input
                  type="date"
                  value={taskForm.due_date || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                />
              </div>
              <Button
                onClick={() => createTaskMutation.mutate(taskForm)}
                disabled={!taskForm.title || !taskForm.due_date || createTaskMutation.isPending}
                className="w-full"
              >
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Task Groups */}
      <div className="space-y-8">
        {groupedTasks.overdue.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-2xl font-bold text-red-900">Overdue ({groupedTasks.overdue.length})</h2>
            </div>
            <div className="space-y-3">
              {groupedTasks.overdue.map(task => (
                <Card key={task.id} className="border-2 border-red-200 bg-red-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={task.status === 'Completed'}
                        onCheckedChange={(checked) => updateTaskMutation.mutate({ id: task.id, status: checked ? 'Completed' : 'Not Started' })}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{task.title}</h3>
                        {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{task.category}</Badge>
                          <Badge className="bg-red-100 text-red-800">
                            Due {new Date(task.due_date).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Upcoming ({groupedTasks.upcoming.length})</h2>
          </div>
          <div className="space-y-3">
            {groupedTasks.upcoming.map(task => (
              <Card key={task.id} className="hover:shadow-md transition-all">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.status === 'Completed'}
                      onCheckedChange={(checked) => updateTaskMutation.mutate({ id: task.id, status: checked ? 'Completed' : 'Not Started' })}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{task.title}</h3>
                      {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{task.category}</Badge>
                        <Badge variant="outline">
                          Due {new Date(task.due_date).toLocaleDateString()}
                        </Badge>
                        {task.priority === 'High' || task.priority === 'Critical' ? (
                          <Badge className="bg-orange-100 text-orange-800">{task.priority}</Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {groupedTasks.upcoming.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No upcoming tasks</p>
              </Card>
            )}
          </div>
        </div>

        {groupedTasks.completed.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Completed ({groupedTasks.completed.length})</h2>
            </div>
            <div className="space-y-3">
              {groupedTasks.completed.map(task => (
                <Card key={task.id} className="bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={true}
                        onCheckedChange={(checked) => updateTaskMutation.mutate({ id: task.id, status: checked ? 'Completed' : 'Not Started' })}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold line-through text-gray-600">{task.title}</h3>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{task.category}</Badge>
                          <Badge className="bg-green-100 text-green-800">✓ Completed</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}