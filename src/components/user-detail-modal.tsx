"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Calendar, 
  DollarSign, 
  Server, 
  Activity,
  Shield,
  Ban,
  UserCheck,
  Edit,
  Save,
  X,
  Eye,
  EyeOff
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface UserDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onUpdate: () => void;
}

export function UserDetailModal({ open, onOpenChange, user, onUpdate }: UserDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'USER',
        isActive: user.isActive
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/management/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setIsEditing(false);
        onUpdate();
        onOpenChange(false);
      } else {
        const error = await response.json();
        console.error('Failed to update user:', error.error);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user || !newPassword) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/management/users/${user.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        setNewPassword('');
        setShowPassword(false);
        alert('Password updated successfully');
      } else {
        const error = await response.json();
        console.error('Failed to update password:', error.error);
      }
    } catch (error) {
      console.error('Error updating password:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-violet-500" />
            Detail User
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Lihat dan edit informasi user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Informasi User</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="border-gray-600 text-gray-300 hover:bg-violet-600/20 hover:border-violet-500 hover:text-violet-400"
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Batal
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Nama Lengkap</Label>
                {isEditing ? (
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{user.name || 'Tidak ada nama'}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Email</Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Role</Label>
                {isEditing ? (
                  <Select
                    value={editForm.role}
                    onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <Badge className={user.role === 'ADMIN' ? 'bg-purple-500' : 'bg-blue-500'}>
                      {user.role}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Status Aktif</Label>
                <div className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                  {isEditing ? (
                    <Switch
                      checked={editForm.isActive}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                    />
                  ) : (
                    <>
                      {user.isActive ? (
                        <UserCheck className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Ban className="h-4 w-4 text-red-500" />
                      )}
                    </>
                  )}
                  <span className={user.isActive ? 'text-emerald-400' : 'text-red-400'}>
                    {user.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Statistics Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Statistik User</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <DollarSign className="h-5 w-5" />
                  <span className="text-sm font-medium">Total Spent</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(user.totalSpent || 0)}
                </p>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Server className="h-5 w-5" />
                  <span className="text-sm font-medium">Active Services</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {user.activeServices || 0}
                </p>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 text-violet-400 mb-2">
                  <Activity className="h-5 w-5" />
                  <span className="text-sm font-medium">Total Services</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {user.services?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Dates Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Informasi Tanggal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Tanggal Daftar</p>
                  <p className="text-sm text-white">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
                <Activity className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Login Terakhir</p>
                  <p className="text-sm text-white">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Belum pernah login'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Ubah Password</h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={!newPassword || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update Password
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {isEditing && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan
                  </>
                )}
              </Button>
            </>
          )}
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Tutup
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}