"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
	const [language, setLanguage] = useState("en")
	const [password, setPassword] = useState("")
	const [logoutOpen, setLogoutOpen] = useState(false)
	const [deleteOpen, setDeleteOpen] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	useEffect(() => {
		const load = async () => {
			const { data: { user } } = await supabase.auth.getUser()
			if (!user) return
			const { data: dbUser } = await supabase.from('users').select('language').eq('id', user.id).maybeSingle()
			if (dbUser?.language) setLanguage(dbUser.language)
		}
		load()
	}, [])

	const saveSettings = async () => {
		setIsSaving(true)
		const { data: { user } } = await supabase.auth.getUser()
		if (!user) {
			setIsSaving(false)
			return alert('Not authenticated')
		}
		const { error } = await supabase.from('users').update({ language }).eq('id', user.id)
		if (error) {
			setIsSaving(false)
			return alert('Failed to save settings')
		}
		setIsSaving(false)
		alert('Settings saved')
	}

	const changePassword = async () => {
		if (!password) return alert('Enter a new password')
		const { error } = await supabase.auth.updateUser({ password })
		if (error) return alert('Failed to change password')
		alert('Password updated')
		setPassword("")
	}

	const deleteAccount = async () => {
		const { data: { user } } = await supabase.auth.getUser()
		if (!user) return
		const { error } = await supabase.from('users').delete().eq('id', user.id)
		if (error) return alert('Failed to delete account')
		await supabase.auth.signOut()
		window.location.href = '/'
	}

	return (
		<div className="text-[#1a1a1a]">
			<div className="mb-5 px-1 md:px-2">
				<p className="text-sm uppercase tracking-[0.28em] text-[#8f7a53]">Account</p>
				<h1 className="font-serif text-3xl font-semibold text-[#111111] md:text-4xl">Settings</h1>
			</div>

			<Card className="max-w-2xl rounded-[28px] border-[#ece4d7] bg-[#fbf7f1] shadow-[0_18px_50px_rgba(17,17,17,0.08)]">
				<CardHeader className="border-b border-[#ece4d7] pb-6">
					<CardTitle className="font-serif text-2xl text-[#111111]">Preferences & Security</CardTitle>
					<p className="text-sm text-gray-500">Keep your account settings aligned with your profile and bookings.</p>
				</CardHeader>

				<CardContent className="space-y-6 p-6 md:p-8">
					<div className="grid gap-2">
						<Label htmlFor="language">Language preference</Label>
						<select
							id="language"
							value={language}
							onChange={(e) => setLanguage(e.target.value)}
							className="h-12 rounded-xl border border-[#ded3c1] bg-white px-4"
						>
							<option value="en">English</option>
							<option value="ph">Filipino</option>
						</select>
					</div>

					<div className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm">
						<div>
							<h3 className="font-semibold text-[#111111]">Security</h3>
							<p className="text-sm text-gray-500">Change your password</p>
						</div>
						<div className="flex flex-col gap-3 md:flex-row">
							<Input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="h-12 rounded-xl border-[#ded3c1] bg-white"
								placeholder="New password"
							/>
							<Button onClick={changePassword} className="h-12 rounded-full bg-[#111111] px-6 text-white hover:bg-[#222222]">
								Change
							</Button>
						</div>
					</div>

					<div className="grid gap-3 rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
						<div>
							<h3 className="font-semibold text-[#111111]">Delete Account</h3>
							<p className="text-sm text-gray-500">Delete your account permanently.</p>
						</div>
						<div className="flex gap-3">
							<Button onClick={() => setDeleteOpen(true)} className="h-12 rounded-full bg-red-600 px-6 text-white hover:bg-red-700">
								Delete Account
							</Button>
		
						</div>
					</div>

					<div className="flex justify-end">
						<Button onClick={saveSettings} disabled={isSaving} className="h-12 rounded-full bg-[#C8A96A] px-6 text-black hover:bg-[#b8985d]">
							{isSaving ? 'Saving...' : 'Save Changes'}
						</Button>
					</div>
				</CardContent>
			</Card>

			<Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
				<DialogContent className="rounded-3xl border-[#ece4d7] bg-[#fffaf2] shadow-[0_18px_50px_rgba(17,17,17,0.16)]">
					<DialogHeader>
						<DialogTitle className="font-serif text-2xl text-[#111111]">Log out?</DialogTitle>
						<DialogDescription className="text-gray-600">
							You will be signed out of your account and returned to the login page.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setLogoutOpen(false)} className="rounded-full border-[#ded3c1] px-5">
							Cancel
						</Button>
						<Button
							onClick={async () => {
								await supabase.auth.signOut()
								window.location.href = '/'
							}}
							className="rounded-full bg-[#111111] px-5 text-white hover:bg-[#222222]"
						>
							Log out
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<DialogContent className="rounded-3xl border-[#ece4d7] bg-[#fffaf2] shadow-[0_18px_50px_rgba(17,17,17,0.16)]">
					<DialogHeader>
						<DialogTitle className="font-serif text-2xl text-[#111111]">Delete account?</DialogTitle>
						<DialogDescription className="text-gray-600">
							This will permanently remove your profile and all saved user data. This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-full border-[#ded3c1] px-5">
							Cancel
						</Button>
						<Button
							onClick={deleteAccount}
							className="rounded-full bg-red-600 px-5 text-white hover:bg-red-700"
						>
							Delete account
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}

