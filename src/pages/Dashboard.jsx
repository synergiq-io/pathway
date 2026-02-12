import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Target,
  GraduationCap,
  Trophy,
  FileText,
  DollarSign,
  Dumbbell,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      
      if (userData?.email) {
        const profiles = await base44.entities.StudentProfile.filter({ created_by: userData.email }, '-created_date', 1);
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }
      }
    };
    loadUser();
  }, []);

  const { data: colleges = [] } = useQuery({
    queryKey: ['student-colleges', user?.email],
    queryFn: () => base44.entities.StudentCollegeList.filter({ student_email: user?.email }),
    enabled: !!user?.email
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['student-tasks', user?.email],
    queryFn: () => base44.entities.Task.filter({ student_email: user?.email }),
    enabled: !!user?.email
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['student-activities', user?.email],
    queryFn: () => base44.entities.Activity.filter({ student_email: user?.email }),
    enabled: !!user?.email
  });

  const { data: scholarships = [] } = useQuery({
    queryKey: ['student-scholarships', user?.email],
    queryFn: () => base44.entities.ScholarshipApplication.filter({ student_email: user?.email }),
    enabled: !!user?.email
  });

  const { data: essays = [] } = useQuery({
    queryKey: ['student-essays', user?.email],
    queryFn: () => base44.entities.EssayProject.filter({ student_email: user?.email }),
    enabled: !!user?.email
  });

  // Calculate readiness score
  const calculateReadiness = () => {
    let score = 0;
    const weights = profile?.grade >= 11 
      ? { academic: 25, activities: 15, colleges: 30, essays: 20, scholarships: 10 }
      : { academic: 40, activities: 30, colleges: 15, essays: 10, scholarships: 5 };

    // Academic
    if (profile?.gpa_weighted || profile?.gpa_unweighted) score += weights.academic * 0.7;
    if (profile?.test_scores?.sat || profile?.test_scores?.act) score += weights.academic * 0.3;

    // Activities
    if (activities.length >= 3) score += weights.activities;
    else if (activities.length > 0) score += weights.activities * 0.5;

    // Colleges
    if (colleges.length >= 5) score += weights.colleges;
    else if (colleges.length > 0) score += weights.colleges * (colleges.length / 5);

    // Essays
    const completedEssays = essays.filter(e => e.status === 'Final').length;
    if (completedEssays >= 3) score += weights.essays;
    else if (completedEssays > 0) score += weights.essays * (completedEssays / 3);

    // Scholarships
    if (scholarships.length >= 5) score += weights.scholarships;
    else if (scholarships.length > 0) score += weights.scholarships * (scholarships.length / 5);

    return Math.round(score);
  };

  const readinessScore = calculateReadiness();
  const upcomingTasks = tasks.filter(t => t.status !== 'Completed').slice(0, 5);
  const overdueTasks = tasks.filter(t => t.status !== 'Completed' && new Date(t.due_date) < new Date());

  const stats = [
    { label: "College Readiness", value: `${readinessScore}%`, icon: Target, color: "from-purple-500 to-pink-500", progress: readinessScore },
    { label: "Colleges on List", value: colleges.length, icon: GraduationCap, color: "from-blue-500 to-cyan-500", link: "Colleges" },
    { label: "Active Tasks", value: tasks.filter(t => t.status !== 'Completed').length, icon: Clock, color: "from-orange-500 to-red-500", link: "Timeline" },
    { label: "Activities", value: activities.length, icon: Trophy, color: "from-green-500 to-emerald-500", link: "Activities" },
    { label: "Scholarships", value: scholarships.length, icon: DollarSign, color: "from-yellow-500 to-orange-500", link: "Scholarships" },
    { label: "Essays", value: essays.length, icon: FileText, color: "from-indigo-500 to-purple-500", link: "Essays" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {profile?.first_name || 'there'}! 👋
        </h1>
        <p className="text-lg text-gray-600">
          {profile?.grade && `Grade ${profile.grade} • `}
          Let's keep making progress on your college journey
        </p>
      </motion.div>

      {/* Alerts */}
      {overdueTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">
                    You have {overdueTasks.length} overdue {overdueTasks.length === 1 ? 'task' : 'tasks'}
                  </h3>
                  <p className="text-sm text-red-700">Review your timeline to catch up</p>
                </div>
                <Link to={createPageUrl("Timeline")}>
                  <Button variant="destructive">View Tasks</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <Link to={stat.link ? createPageUrl(stat.link) : '#'}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      {stat.link && (
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    {stat.progress !== undefined && (
                      <Progress value={stat.progress} className="mt-3" />
                    )}
                  </CardContent>
                </Link>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Upcoming Tasks
            </CardTitle>
            <CardDescription>Your next 5 priorities</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'Critical' ? 'bg-red-500' :
                      task.priority === 'High' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      <p className="text-xs text-gray-500">Due {new Date(task.due_date).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="secondary">{task.category}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No tasks yet. Add colleges to get started!</p>
            )}
            <Link to={createPageUrl("Timeline")}>
              <Button variant="outline" className="w-full mt-4">View All Tasks</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Get things done faster</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to={createPageUrl("Colleges")}>
              <Button variant="outline" className="w-full justify-start">
                <GraduationCap className="w-4 h-4 mr-2" />
                Add a College
              </Button>
            </Link>
            <Link to={createPageUrl("Activities")}>
              <Button variant="outline" className="w-full justify-start">
                <Trophy className="w-4 h-4 mr-2" />
                Log an Activity
              </Button>
            </Link>
            <Link to={createPageUrl("Essays")}>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Start an Essay
              </Button>
            </Link>
            <Link to={createPageUrl("Scholarships")}>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="w-4 h-4 mr-2" />
                Find Scholarships
              </Button>
            </Link>
            <Link to={createPageUrl("AdviceCorner")}>
              <Button variant="outline" className="w-full justify-start">
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Advice
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Progress Insights */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Your Progress Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {readinessScore < 30 && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Just Getting Started</h4>
                  <p className="text-sm text-blue-700">Complete your profile and add your first college to boost your readiness score!</p>
                </div>
              </div>
            )}
            {readinessScore >= 30 && readinessScore < 60 && (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900">Building Momentum</h4>
                  <p className="text-sm text-yellow-700">You're making progress! Focus on adding more activities and starting your essays.</p>
                </div>
              </div>
            )}
            {readinessScore >= 60 && (
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900">Looking Strong!</h4>
                  <p className="text-sm text-green-700">You're well on your way. Keep completing tasks and refining your applications.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}