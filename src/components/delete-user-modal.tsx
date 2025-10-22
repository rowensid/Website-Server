"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onUpdate: () => void;
}

export function DeleteUserModal({ open, onOpenChange, user, onUpdate }: DeleteUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (!user || confirmText !== 'DELETE') return;

    setLoading(true);
    try {
      const response = await fetch(`/api/management/users/${user.id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'delete' }),
      });

      if (response.ok) {
        onUpdate();
        onOpenChange(false);
        setConfirmText('');
      } else {
        const error = await response.json();
        console.error('Failed to delete user:', error.error);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-red-400">
            <Trash2 className="h-5 w-5" />
            Hapus User
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Tindakan ini tidak dapat dibatalkan. User dan semua data terkait akan dihapus permanen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-red-500/20 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              <strong>Peringatan:</strong> Menghapus user akan menghapus:
              <ul className="mt-2 list-disc list-inside text-sm">
                <li>Semua layanan yang dimiliki</li>
                <li>Sejarah pesanan</li>
                <li>Data sesi login</li>
                <li>Semua data terkait user</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-300 mb-2">User yang akan dihapus:</p>
            <div className="space-y-1">
              <p className="font-medium text-white">{user.name || 'Tidak ada nama'}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  user.role === 'ADMIN' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {user.role}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  user.isActive ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {user.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Ketik <span className="text-red-400 font-mono">DELETE</span> untuk konfirmasi:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 focus:border-red-500 focus:ring-red-500"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setConfirmText('');
            }}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading || confirmText !== 'DELETE'}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}