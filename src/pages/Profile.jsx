import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, GraduationCap, Target, Dumbbell, Save } from "lucide-react";
import { toast } from "sonner";

const US_STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadProfile = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      
      if (userData?.email) {
        const profiles = await base44.entities.StudentProfile.filter({ created_by: userData.email }, '-created_date', 1);
        if (profiles.length > 0) {
          setProfile(profiles[0]);
          setFormData(profiles[0]);
        } else {
          setFormData({ is_athlete: false, grade: 9 });
        }
      }
    };
    loadProfile();
  }, []);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (profile?.id) {
        return base44.entities.StudentProfile.update(profile.id, data);
      } else {
        return base44.entities.StudentProfile.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success("Profile saved successfully!");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-lg text-gray-600">Keep your information up to date</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">
              <User className="w-4 h-4 mr-2" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="academic">
              <GraduationCap className="w-4 h-4 mr-2" />
              Academic
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="w-4 h-4 mr-2" />
              Goals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={formData.first_name || ''}
                      onChange={(e) => updateField('first_name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={formData.last_name || ''}
                      onChange={(e) => updateField('last_name', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Birthdate</Label>
                    <Input
                      type="date"
                      value={formData.birthdate || ''}
                      onChange={(e) => updateField('birthdate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Grade</Label>
                    <Select value={formData.grade?.toString()} onValueChange={(v) => updateField('grade', parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[6, 7, 8, 9, 10, 11, 12].map(g => (
                          <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>State</Label>
                    <Select value={formData.state} onValueChange={(v) => updateField('state', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>School Type</Label>
                    <Select value={formData.school_type} onValueChange={(v) => updateField('school_type', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Public">Public</SelectItem>
                        <SelectItem value="Private">Private</SelectItem>
                        <SelectItem value="Charter">Charter</SelectItem>
                        <SelectItem value="Homeschool">Homeschool</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>School Name</Label>
                  <Input
                    value={formData.school_name || ''}
                    onChange={(e) => updateField('school_name', e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <Switch
                    checked={formData.is_athlete || false}
                    onCheckedChange={(checked) => updateField('is_athlete', checked)}
                  />
                  <div>
                    <Label className="text-base">I'm an athlete interested in college sports</Label>
                    <p className="text-sm text-gray-600">This will enable athletic recruiting features</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic">
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>GPA (Weighted)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="5"
                      value={formData.gpa_weighted || ''}
                      onChange={(e) => updateField('gpa_weighted', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>GPA (Unweighted)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData.gpa_unweighted || ''}
                      onChange={(e) => updateField('gpa_unweighted', parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Class Rank (optional)</Label>
                    <Input
                      type="number"
                      value={formData.class_rank || ''}
                      onChange={(e) => updateField('class_rank', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Class Size (optional)</Label>
                    <Input
                      type="number"
                      value={formData.class_size || ''}
                      onChange={(e) => updateField('class_size', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Intended Major(s) - separate with commas</Label>
                  <Input
                    value={formData.intended_majors?.join(', ') || ''}
                    onChange={(e) => updateField('intended_majors', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="e.g., Computer Science, Mathematics"
                  />
                </div>

                <div>
                  <Label>Career Interests - separate with commas</Label>
                  <Textarea
                    value={formData.career_interests?.join(', ') || ''}
                    onChange={(e) => updateField('career_interests', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="e.g., Software Engineer, Data Scientist"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle>College Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Target College Tier</Label>
                  <Select value={formData.target_college_tier} onValueChange={(v) => updateField('target_college_tier', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Highly Selective">Highly Selective (Top 50)</SelectItem>
                      <SelectItem value="Selective">Selective</SelectItem>
                      <SelectItem value="Open Admission">Open Admission</SelectItem>
                      <SelectItem value="Undecided">Undecided</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Geographic Preferences - separate with commas</Label>
                  <Input
                    value={formData.geographic_preferences?.join(', ') || ''}
                    onChange={(e) => updateField('geographic_preferences', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="e.g., Northeast, California, Anywhere"
                  />
                </div>

                <div>
                  <Label>Financial Aid Importance (1 = Not Important, 5 = Critical)</Label>
                  <Select value={formData.financial_aid_importance?.toString()} onValueChange={(v) => updateField('financial_aid_importance', parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="submit" disabled={saveMutation.isPending} className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}