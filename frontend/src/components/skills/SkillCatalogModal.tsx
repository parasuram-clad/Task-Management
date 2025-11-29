import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Skill, SkillCategory } from '../../types/skills';

interface SkillCatalogModalProps {
  open: boolean;
  onClose: () => void;
  editingSkill?: Skill | null;
}

export function SkillCatalogModal({ open, onClose, editingSkill }: SkillCatalogModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Technical' as SkillCategory,
    description: '',
    tags: [] as string[],
    default_guidelines: '',
    is_active: true,
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (editingSkill) {
      setFormData({
        name: editingSkill.name,
        category: editingSkill.category,
        description: editingSkill.description,
        tags: editingSkill.tags,
        default_guidelines: editingSkill.default_guidelines || '',
        is_active: editingSkill.is_active,
      });
    } else {
      setFormData({
        name: '',
        category: 'Technical',
        description: '',
        tags: [],
        default_guidelines: '',
        is_active: true,
      });
    }
    setTagInput('');
  }, [editingSkill, open]);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a skill name');
      return;
    }

    // In a real app, this would make an API call
    if (editingSkill) {
      toast.success('Skill updated successfully');
    } else {
      toast.success('Skill added to catalog');
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSkill ? 'Edit Skill' : 'Add New Skill to Catalog'}
          </DialogTitle>
          <DialogDescription>
            {editingSkill
              ? 'Update skill details in the master catalog'
              : 'Add a new skill to the master catalog that employees can select'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Skill Name */}
            <div>
              <Label htmlFor="name">Skill Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., React, Python, Project Management"
                required
              />
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

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the skill..."
                rows={3}
                required
              />
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tags (e.g., Frontend, Cloud, AI/ML)"
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Default Guidelines */}
            <div>
              <Label htmlFor="guidelines">Proficiency Guidelines (Optional)</Label>
              <Textarea
                id="guidelines"
                value={formData.default_guidelines}
                onChange={(e) => setFormData(prev => ({ ...prev, default_guidelines: e.target.value }))}
                placeholder="e.g., Expert: Can architect large-scale applications, mentor others..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Provide guidance on what different proficiency levels mean for this skill
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="is_active" className="cursor-pointer mb-0">
                Active (employees can select this skill)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingSkill ? 'Update Skill' : 'Add to Catalog'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
