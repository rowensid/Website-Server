"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Server,
  CreditCard,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign,
  User,
  Settings,
  ChevronDown,
  RefreshCw,
  ArrowLeft,
  Plus,
  LogOut,
  Gamepad2,
  Monitor,
  Code,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ServerData {
  id: string;
  name: string;
  type: string;
  status: string;
  price: number;
  config: any;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderData {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export default function MemberDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [servers, setServers] = useState<ServerData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showNewServerModal, setShowNewServerModal] = useState(false);
  const [newServer, setNewServer] = useState({
    name: "",
    type: "",
    duration: "30",
  });
  const router = useRouter();

  useEffect(() => {
    fetchMemberData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const fetchMemberData = async () => {
    try {
      const [userRes, serversRes, ordersRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/member/servers"),
        fetch("/api/member/orders"),
      ]);
      if (userRes.ok) {
        const userData = await userRes.json();
        setUserData(userData.user);
      }
      if (serversRes.ok) {
        const serversData = await serversRes.json();
        setServers(serversData.servers || []);
      }
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch member data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMemberData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "COMPLETED":
        return "bg-green-500";
      case "PENDING":
        return "bg-amber-500";
      case "SUSPENDED":
      case "CANCELLED":
      case "FAILED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Aktif";
      case "PENDING":
        return "Menunggu";
      case "SUSPENDED":
        return "Ditangguhkan";
      case "CANCELLED":
        return "Dibatalkan";
      case "COMPLETED":
        return "Selesai";
      default:
        return status;
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "GAME_HOSTING":
        return <Gamepad2 className="w-5 h-5" />;
      case "RDP":
        return <Monitor className="w-5 h-5" />;
      case "FIVEM_DEVELOPMENT":
      case "ROBLOX_DEVELOPMENT":
        return <Code className="w-5 h-5" />;
      default:
        return <Server className="w-5 h-5" />;
    }
  };

  const activeServers = servers.filter((s) => s.status === "ACTIVE").length;
  const totalSpent = orders.reduce((sum, o) => sum + o.amount, 0);
  const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-violet-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* HEADER */}
      <header className="bg-gray-800/90 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-violet-400" />
            <h1 className="text-xl font-bold text-white">Member Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-gray-300 border-gray-600 hover:bg-violet-600/20 hover:border-violet-500 hover:text-violet-400"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-400 hover:text-white hover:bg-red-600/20"
            >
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-white mb-4">
          Selamat datang, {userData?.name || "Member"} 👋
        </h2>

        {/* CARD METRICS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg">
            <CardHeader className="flex justify-between">
              <CardTitle>Server Aktif</CardTitle>
              <Server className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeServers}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
            <CardHeader className="flex justify-between">
              <CardTitle>Total Pengeluaran</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg">
            <CardHeader className="flex justify-between">
              <CardTitle>Pesanan Selesai</CardTitle>
              <CheckCircle2 className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedOrders}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-lg">
            <CardHeader className="flex justify-between">
              <CardTitle>Member Sejak</CardTitle>
              <Calendar className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userData ? new Date(userData.createdAt).getFullYear() : "-"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-800 border border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-violet-600">
              <Activity className="h-4 w-4 mr-2" /> Ringkasan
            </TabsTrigger>
            <TabsTrigger value="servers" className="data-[state=active]:bg-violet-600">
              <Server className="h-4 w-4 mr-2" /> Server Saya
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-violet-600">
              <CreditCard className="h-4 w-4 mr-2" /> Riwayat Pesanan
            </TabsTrigger>
          </TabsList>

          {/* SERVERS TAB */}
          <TabsContent value="servers">
            <Card className="bg-gray-800 border-gray-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-500" />
                  Semua Server Saya
                </CardTitle>
              </CardHeader>
              <CardContent>
                {servers.length === 0 ? (
                  <div className="text-center py-8">
                    <Server className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Anda belum memiliki server</p>

                    {/* POPUP PESAN BARU */}
                    <Dialog open={showNewServerModal} onOpenChange={setShowNewServerModal}>
                      <DialogTrigger asChild>
                        <Button className="mt-4 bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700">
                          <Plus className="w-4 h-4 mr-2" /> Pesan Server Baru
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="bg-gray-900 border border-violet-700 text-white max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                            Pesan Server Baru
                          </DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Pilih layanan dan isi detail pemesananmu di bawah.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                          <div>
                            <Label>Nama Server</Label>
                            <Input
                              placeholder="contoh: My Private Server"
                              value={newServer.name}
                              onChange={(e) =>
                                setNewServer({ ...newServer, name: e.target.value })
                              }
                              className="bg-gray-800 border-gray-700 text-white mt-1"
                            />
                          </div>

                          <div>
                            <Label>Jenis Layanan</Label>
                            <Select
                              value={newServer.type}
                              onValueChange={(val) =>
                                setNewServer({ ...newServer, type: val })
                              }
                            >
                              <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                                <SelectValue placeholder="Pilih jenis server" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 text-white border-gray-700">
                                <SelectItem value="GAME_HOSTING">🎮 Game Hosting</SelectItem>
                                <SelectItem value="RDP">💻 RDP (Windows Server)</SelectItem>
                                <SelectItem value="FIVEM_DEVELOPMENT">
                                  🚓 FiveM Development
                                </SelectItem>
                                <SelectItem value="ROBLOX_DEVELOPMENT">
                                  🧱 Roblox Development
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Durasi (hari)</Label>
                            <Select
                              value={newServer.duration}
                              onValueChange={(val) =>
                                setNewServer({ ...newServer, duration: val })
                              }
                            >
                              <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                                <SelectValue placeholder="Pilih durasi" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 text-white border-gray-700">
                                <SelectItem value="30">30 Hari</SelectItem>
                                <SelectItem value="90">90 Hari</SelectItem>
                                <SelectItem value="180">180 Hari</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <DialogFooter className="mt-6 flex justify-end">
                          <Button
                            onClick={() => {
                              // TODO: kirim data ke API
                              console.log("Pesan server baru:", newServer);
                              setShowNewServerModal(false);
                            }}
                            className="bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700"
                          >
                            Konfirmasi Pesanan
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <p className="text-gray-300">Server aktif: {servers.length}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
