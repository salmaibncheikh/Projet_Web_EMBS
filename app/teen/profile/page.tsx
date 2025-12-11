"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { 
  User, 
  Bell,
  Lock,
  Shield,
  Heart,
  Moon,
  Globe,
  Smartphone,
  Mail,
  Calendar,
  MapPin,
  Phone,
  Save,
  Camera,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"

export default function TeenProfilePage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    location: '',
  })

  const [healthData, setHealthData] = useState({
    height: '',
    weight: '',
    conditions: '',
    allergies: '',
  })

  const [notifications, setNotifications] = useState({
    medicationReminders: true,
    healthTips: true,
    moodCheckIns: true,
    weeklyReports: false,
    messageAlerts: true,
  })

  const [privacy, setPrivacy] = useState({
    shareHealthData: false,
    allowDoctorAccess: true,
    showOnlineStatus: true,
  })

  useEffect(() => {
    if (user?.email) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/teen/profile?userId=${user?.email}`)
      if (response.ok) {
        const { profile } = await response.json()
        if (profile) {
          setProfileData({
            name: profile.personalInfo?.name || user?.name || '',
            email: profile.personalInfo?.email || user?.email || '',
            phone: profile.personalInfo?.phone || '',
            dateOfBirth: profile.personalInfo?.dateOfBirth || '',
            location: profile.personalInfo?.location || '',
          })
          setHealthData({
            height: profile.healthInfo?.height?.toString() || '',
            weight: profile.healthInfo?.weight?.toString() || '',
            conditions: profile.healthInfo?.conditions || '',
            allergies: profile.healthInfo?.allergies || '',
          })
          if (profile.notifications) {
            setNotifications(profile.notifications)
          }
          if (profile.privacy) {
            setPrivacy(profile.privacy)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user?.email) return
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/teen/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.email,
          personalInfo: profileData,
          healthInfo: {
            height: healthData.height ? parseFloat(healthData.height) : undefined,
            weight: healthData.weight ? parseFloat(healthData.weight) : undefined,
            conditions: healthData.conditions,
            allergies: healthData.allergies,
          },
          notifications,
          privacy
        })
      })

      if (response.ok) {
        alert('Profil sauvegardé avec succès ! ✓')
      } else {
        throw new Error('Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Erreur lors de la sauvegarde du profil')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/40 via-pink-50/30 to-blue-50/40 p-6 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500/80 via-pink-500/80 to-blue-500/80 p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
            <span className="text-4xl">⚙️</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">Mon Profil</h1>
            <p className="text-white/90 mt-1 font-medium">Personnalise ton espace santé</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-2">
          <TabsList className="w-full bg-transparent grid grid-cols-4">
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl">
              <User className="w-4 h-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl">
              <Shield className="w-4 h-4 mr-2" />
              Confidentialité
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl">
              <Lock className="w-4 h-4 mr-2" />
              Sécurité
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Profile Photo */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Photo de profil</h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-4xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-purple-300 hover:bg-purple-50 transition-all">
                  <Camera className="w-4 h-4 text-purple-600" />
                </button>
              </div>
              <div>
                <Button variant="outline" className="rounded-xl mb-2">
                  <Camera className="w-4 h-4 mr-2" />
                  Changer la photo
                </Button>
                <p className="text-sm text-gray-600">JPG, PNG ou GIF (max. 5MB)</p>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Informations personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="pl-10 bg-white/60 border-purple-200/40 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="pl-10 bg-white/60 border-purple-200/40 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="+33 6 12 34 56 78"
                    className="pl-10 bg-white/60 border-purple-200/40 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dob">Date de naissance</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="dob"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                    className="pl-10 bg-white/60 border-purple-200/40 rounded-xl"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="location">Ville</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    placeholder="Paris, France"
                    className="pl-10 bg-white/60 border-purple-200/40 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSaveProfile} 
              disabled={isSaving}
              className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>

          {/* Health Info */}
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Informations de santé</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Taille (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={healthData.height}
                  onChange={(e) => setHealthData({...healthData, height: e.target.value})}
                  placeholder="170"
                  className="mt-1 bg-white/60 border-purple-200/40 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="weight">Poids (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={healthData.weight}
                  onChange={(e) => setHealthData({...healthData, weight: e.target.value})}
                  placeholder="65"
                  className="mt-1 bg-white/60 border-purple-200/40 rounded-xl"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="conditions">Conditions médicales</Label>
                <Input
                  id="conditions"
                  value={healthData.conditions}
                  onChange={(e) => setHealthData({...healthData, conditions: e.target.value})}
                  placeholder="Aucune / Asthme, allergies..."
                  className="mt-1 bg-white/60 border-purple-200/40 rounded-xl"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Input
                  id="allergies"
                  value={healthData.allergies}
                  onChange={(e) => setHealthData({...healthData, allergies: e.target.value})}
                  placeholder="Aucune / Arachides, lactose..."
                  className="mt-1 bg-white/60 border-purple-200/40 rounded-xl"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Préférences de notification</h3>
            
            <div className="space-y-4">
              {[
                { key: 'healthTips', label: 'Conseils santé quotidiens', icon: Smartphone, description: 'Astuces et conseils personnalisés chaque jour' },
                { key: 'moodCheckIns', label: 'Check-ins humeur', icon: Moon, description: 'Rappels pour enregistrer ton humeur' },
                { key: 'weeklyReports', label: 'Rapports hebdomadaires', icon: Calendar, description: 'Résumé de ta semaine santé' },
                { key: 'messageAlerts', label: 'Messages', icon: Mail, description: 'Notifications pour nouveaux messages' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-purple-200/30">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400/70 to-pink-500/70 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{item.label}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) => setNotifications({...notifications, [item.key]: checked})}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Paramètres de confidentialité</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-purple-200/30">
                <div>
                  <p className="font-semibold text-gray-800">Partage des données de santé</p>
                  <p className="text-sm text-gray-600">Permettre l'analyse anonyme de tes données pour la recherche</p>
                </div>
                <Switch
                  checked={privacy.shareHealthData}
                  onCheckedChange={(checked) => setPrivacy({...privacy, shareHealthData: checked})}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-purple-200/30">
                <div>
                  <p className="font-semibold text-gray-800">Accès médecins</p>
                  <p className="text-sm text-gray-600">Permettre aux médecins de voir ton historique de santé</p>
                </div>
                <Switch
                  checked={privacy.allowDoctorAccess}
                  onCheckedChange={(checked) => setPrivacy({...privacy, allowDoctorAccess: checked})}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-purple-200/30">
                <div>
                  <p className="font-semibold text-gray-800">Statut en ligne</p>
                  <p className="text-sm text-gray-600">Afficher quand tu es en ligne dans la messagerie</p>
                </div>
                <Switch
                  checked={privacy.showOnlineStatus}
                  onCheckedChange={(checked) => setPrivacy({...privacy, showOnlineStatus: checked})}
                />
              </div>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-red-200/30 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Zone de danger</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-left rounded-xl border-red-300 text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer toutes mes données de santé
              </Button>
              <Button variant="outline" className="w-full justify-start text-left rounded-xl border-red-300 text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer mon compte définitivement
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Changer le mot de passe</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <Input
                  id="current-password"
                  type="password"
                  className="mt-1 bg-white/60 border-purple-200/40 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input
                  id="new-password"
                  type="password"
                  className="mt-1 bg-white/60 border-purple-200/40 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  className="mt-1 bg-white/60 border-purple-200/40 rounded-xl"
                />
              </div>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl">
                <Lock className="w-4 h-4 mr-2" />
                Mettre à jour le mot de passe
              </Button>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Authentification à deux facteurs</h3>
            <p className="text-gray-700 mb-4">
              Ajoute une couche de sécurité supplémentaire à ton compte en activant l'authentification à deux facteurs.
            </p>
            <Button variant="outline" className="rounded-xl">
              <Shield className="w-4 h-4 mr-2" />
              Activer 2FA
            </Button>
          </div>

          <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Sessions actives</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-purple-200/30">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Windows • Chrome</p>
                    <p className="text-sm text-gray-600">Paris, France • Maintenant</p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Actuelle</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
