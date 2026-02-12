import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, GraduationCap, MapPin, TrendingUp, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function Colleges() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [category, setCategory] = useState('Target');
  const [appType, setAppType] = useState('RD');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: allColleges = [] } = useQuery({
    queryKey: ['all-colleges'],
    queryFn: () => base44.entities.College.filter({ is_active: true }, 'name', 100)
  });

  const { data: myColleges = [] } = useQuery({
    queryKey: ['my-colleges', user?.email],
    queryFn: () => base44.entities.StudentCollegeList.filter({ student_email: user?.email }),
    enabled: !!user?.email
  });

  const addCollegeMutation = useMutation({
    mutationFn: async ({ college_id, category, application_type }) => {
      const exists = myColleges.find(c => c.college_id === college_id);
      if (exists) {
        throw new Error('College already on your list');
      }
      return base44.entities.StudentCollegeList.create({
        student_email: user.email,
        college_id,
        category,
        application_type
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-colleges'] });
      setAddDialogOpen(false);
      setSelectedCollege(null);
      toast.success('College added to your list!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const removeCollegeMutation = useMutation({
    mutationFn: (id) => base44.entities.StudentCollegeList.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-colleges'] });
      toast.success('College removed from your list');
    }
  });

  const filteredColleges = allColleges.filter(college =>
    searchQuery === '' || 
    college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    college.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    college.state?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCollegesByCategory = (cat) => {
    return myColleges.filter(mc => mc.category === cat).map(mc => {
      const college = allColleges.find(c => c.id === mc.college_id);
      return { ...mc, college };
    });
  };

  const handleAddCollege = () => {
    if (selectedCollege) {
      addCollegeMutation.mutate({
        college_id: selectedCollege.id,
        category,
        application_type: appType
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Colleges</h1>
          <p className="text-lg text-gray-600">{myColleges.length} colleges on your list</p>
        </div>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Add College
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add College to Your List</DialogTitle>
            </DialogHeader>
            
            {!selectedCollege ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search colleges..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                  {filteredColleges.map(college => (
                    <Card
                      key={college.id}
                      className="cursor-pointer hover:border-purple-300 transition-all"
                      onClick={() => setSelectedCollege(college)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{college.name}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {college.city}, {college.state}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {college.ranking_tier && (
                                <Badge variant="secondary">{college.ranking_tier}</Badge>
                              )}
                              {college.college_type && (
                                <Badge variant="outline">{college.college_type}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{selectedCollege.name}</CardTitle>
                        <CardDescription>
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {selectedCollege.city}, {selectedCollege.state}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedCollege(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Reach">Reach</SelectItem>
                      <SelectItem value="Target">Target</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Application Type</label>
                  <Select value={appType} onValueChange={setAppType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ED">Early Decision (ED)</SelectItem>
                      <SelectItem value="ED2">Early Decision 2 (ED2)</SelectItem>
                      <SelectItem value="EA">Early Action (EA)</SelectItem>
                      <SelectItem value="REA">Restrictive Early Action (REA)</SelectItem>
                      <SelectItem value="RD">Regular Decision (RD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAddCollege}
                  disabled={addCollegeMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {addCollegeMutation.isPending ? 'Adding...' : 'Add to My List'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({myColleges.length})</TabsTrigger>
          <TabsTrigger value="reach">Reach ({getCollegesByCategory('Reach').length})</TabsTrigger>
          <TabsTrigger value="target">Target ({getCollegesByCategory('Target').length})</TabsTrigger>
          <TabsTrigger value="safety">Safety ({getCollegesByCategory('Safety').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {myColleges.length === 0 ? (
            <Card className="p-12 text-center">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No colleges yet</h3>
              <p className="text-gray-500 mb-4">Start building your college list</p>
              <Button onClick={() => setAddDialogOpen(true)}>Add Your First College</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myColleges.map(mc => {
                const college = allColleges.find(c => c.id === mc.college_id);
                if (!college) return null;
                return (
                  <Card key={mc.id} className="hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{college.name}</CardTitle>
                          <CardDescription className="mt-1">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {college.city}, {college.state}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 mb-4">
                        <Badge className="bg-purple-100 text-purple-800">{mc.category}</Badge>
                        <Badge variant="outline">{mc.application_type}</Badge>
                      </div>
                      <div className="space-y-2">
                        <Link to={createPageUrl(`CollegeDetail?id=${mc.id}`)}>
                          <Button variant="outline" className="w-full">View Checklist</Button>
                        </Link>
                        <Button
                          variant="ghost"
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeCollegeMutation.mutate(mc.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {['reach', 'target', 'safety'].map(cat => (
          <TabsContent key={cat} value={cat}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getCollegesByCategory(cat.charAt(0).toUpperCase() + cat.slice(1)).map(({ college, ...mc }) => {
                if (!college) return null;
                return (
                  <Card key={mc.id} className="hover:shadow-lg transition-all">
                    <CardHeader>
                      <CardTitle className="text-lg">{college.name}</CardTitle>
                      <CardDescription>
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {college.city}, {college.state}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline" className="mb-4">{mc.application_type}</Badge>
                      <div className="space-y-2">
                        <Link to={createPageUrl(`CollegeDetail?id=${mc.id}`)}>
                          <Button variant="outline" className="w-full">View Checklist</Button>
                        </Link>
                        <Button
                          variant="ghost"
                          className="w-full text-red-600"
                          onClick={() => removeCollegeMutation.mutate(mc.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}