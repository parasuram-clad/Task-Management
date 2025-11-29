import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Plus, Star } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { mockSkills } from '../../data/mockSkills';
import { EmployeeSkill, SkillCategory, ProficiencyLevel } from '../../types/skills';

interface SkillModalProps {
  open: boolean;
  onClose: () => void;
  employeeId: number;
  editingSkill?: EmployeeSkill | null;
}

export function SkillModal({ open, onClose, employeeId, editingSkill }: SkillModalProps) {
  const [formData, setFormData] = useState({
    skill_id: 0,
    skill_name: '',
    category: 'Technical' as SkillCategory,
    proficiency: 'Intermediate' as ProficiencyLevel,
    years_of_experience: 1,
    last_used: new Date().toISOString().split('T')[0],
    self_rating: 3,
    evidence: '',
    request_approval: true,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);

  useEffect(() => {
    if (editingSkill) {
      setFormData({
        skill_id: editingSkill.skill_id,
        skill_name: editingSkill.skill_name,
        category: editingSkill.category,
        proficiency: editingSkill.proficiency,
        years_of_experience: editingSkill.years_of_experience,
        last_used: editingSkill.last_used,
        self_rating: editingSkill.self_rating,
        evidence: editingSkill.evidence || '',
        request_approval: true,
      });
      setSearchQuery(editingSkill.skill_name);
    } else {
      // Reset form for new skill
      setFormData({
        skill_id: 0,
        skill_name: '',
        category: 'Technical',
        proficiency: 'Intermediate',
        years_of_experience: 1,
        last_used: new Date().toISOString().split('T')[0],
        self_rating: 3,
        evidence: '',
        request_approval: true,
      });
      setSearchQuery('');
    }
  }, [editingSkill, open]);

  const filteredSkills = mockSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) && skill.is_active
  );

  const handleSkillSelect = (skill: typeof mockSkills[0]) => {
    setFormData(prev => ({
      ...prev,
      skill_id: skill.id,
      skill_name: skill.name,
      category: skill.category,
    }));
    setSearchQuery(skill.name);
    setShowSkillSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.skill_name) {
      toast.error('Please select or enter a skill name');
      return;
    }

    // In a real app, this would make an API call
    if (editingSkill) {
      toast.success('Skill updated successfully');
    } else {
      if (formData.request_approval) {
        toast.success('Skill added and sent for manager approval');
      } else {
        toast.success('Skill added successfully');
      }
    }

    onClose();
  };

  const renderStarRating = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(rating => (
          <button
            key={rating}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, self_rating: rating }))}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                rating <= formData.self_rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSkill ? 'Edit Skill' : 'Add New Skill'}
          </DialogTitle>
          <DialogDescription>
            {editingSkill
              ? 'Update your skill details and proficiency level'
              : 'Add a new skill to your profile. Select from existing skills or add a new one.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Skill Name with Autocomplete */}
            <div>
              <Label htmlFor="skill">Skill Name *</Label>
              <div className="relative">
                <Input
                  id="skill"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSkillSuggestions(true);
                    setFormData(prev => ({ ...prev, skill_name: e.target.value }));
                  }}
                  onFocus={() => setShowSkillSuggestions(true)}
                  placeholder="Type to search skills..."
                  required
                />
                
                {showSkillSuggestions && searchQuery && filteredSkills.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredSkills.slice(0, 10).map(skill => (
                      <button
                        key={skill.id}
                        type="button"
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                        onClick={() => handleSkillSelect(skill)}
                      >
                        <div>
                          <p className="font-medium">{skill.name}</p>
                          <p className="text-xs text-muted-foreground">{skill.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {skill.category}
                        </Badge>
                      </button>
                    ))}
                    
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 border-t hover:bg-gray-100 flex items-center gap-2 text-sm text-primary"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, skill_id: 0 }));
                        setShowSkillSuggestions(false);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add "{searchQuery}" as new skill
                    </button>
                  </div>
                )}
              </div>
              {editingSkill && editingSkill.status === 'Verified' && editingSkill.approved_by && (
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  ✓ Verified by Manager
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as SkillCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Domain">Domain</SelectItem>
                  <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                  <SelectItem value="Tools">Tools</SelectItem>
                  <SelectItem value="Languages">Languages</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Proficiency */}
              <div>
                <Label htmlFor="proficiency">Proficiency *</Label>
                <Select
                  value={formData.proficiency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, proficiency: value as ProficiencyLevel }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Years of Experience */}
              <div>
                <Label htmlFor="years">Years of Experience *</Label>
                <Input
                  id="years"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.years_of_experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, years_of_experience: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>

            {/* Last Used */}
            <div>
              <Label htmlFor="last_used">Last Used</Label>
              <Input
                id="last_used"
                type="month"
                value={formData.last_used.substring(0, 7)}
                onChange={(e) => setFormData(prev => ({ ...prev, last_used: e.target.value + '-01' }))}
              />
            </div>

            {/* Self Rating */}
            <div>
              <Label>Self Rating (1-5) *</Label>
              <div className="mt-2">
                {renderStarRating()}
              </div>
            </div>

            {/* Evidence */}
            <div>
              <Label htmlFor="evidence">Evidence (Optional)</Label>
              <Textarea
                id="evidence"
                value={formData.evidence}
                onChange={(e) => setFormData(prev => ({ ...prev, evidence: e.target.value }))}
                placeholder="Add links to portfolio, GitHub, certifications, or describe your experience..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Providing evidence helps your manager verify your skills more quickly
              </p>
            </div>

            {/* Request Approval */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                id="request_approval"
                checked={formData.request_approval}
                onChange={(e) => setFormData(prev => ({ ...prev, request_approval: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="request_approval" className="cursor-pointer mb-0">
                Request manager approval
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingSkill ? 'Update Skill' : 'Add Skill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
