"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Leaf, TrendingUp, Users, Zap, Droplet, Recycle } from "lucide-react"
import { motion } from "framer-motion"

export default function Home() {
  const [co2Saved, setCo2Saved] = useState(0)
  const [tonsRecycled, setTonsRecycled] = useState(0)
  const [ngosSupported, setNgosSupported] = useState(0)

  // Animate counters on mount
  useEffect(() => {
    const animateCounter = (setter: (v: number) => void, target: number, duration: number) => {
      const start = 0
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        setter(Math.floor(target * progress))

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      animate()
    }

    animateCounter(setCo2Saved, 15420, 2000)
    animateCounter(setTonsRecycled, 2847, 2000)
    animateCounter(setNgosSupported, 156, 2000)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-10 left-10 w-20 h-20 text-primary/10"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
          >
            <Leaf className="w-full h-full" />
          </motion.div>
          <motion.div
            className="absolute bottom-20 right-10 w-32 h-32 text-secondary/10"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
          >
            <Recycle className="w-full h-full" />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Turning Waste into Worth</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-balance">
              Schedule free pickups for your scrap metal, e-waste, and plastics. Track your impact and help build a
              greener planet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="btn-hover">
                <Link href="/dashboard">
                  Schedule Pickup
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="btn-hover bg-transparent">
                <Link href="#how-it-works">Learn More</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-32 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Three simple steps to make a difference</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Zap,
                title: "Schedule",
                description: "Tell us what you have and where you are. We handle the rest.",
              },
              {
                icon: TrendingUp,
                title: "Track",
                description: "Our collector picks it up. Watch its status live on your dashboard.",
              },
              {
                icon: Leaf,
                title: "Impact",
                description: "See your waste get recycled and earn Green Points!",
              },
            ].map((step, idx) => {
              const Icon = step.icon
              return (
                <motion.div key={idx} variants={itemVariants}>
                  <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 ease-out h-full">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Role-Based Login Section */}
      <section id="roles" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Role</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join EcoTrack as a Citizen, Admin, Collector, or NGO Partner
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Leaf,
                title: "Citizen",
                subtitle: "Schedule Pickups",
                description:
                  "Schedule free pickups for your scrap and waste. Track your environmental impact in real-time.",
                color: "primary",
                href: "/auth?role=citizen",
              },
              {
                icon: Users,
                title: "Admin",
                subtitle: "Manage System",
                description:
                  "Oversee all pickups, manage collectors, and monitor system-wide analytics and performance.",
                color: "secondary",
                href: "/auth?role=admin",
              },
              {
                icon: TrendingUp,
                title: "Collector",
                subtitle: "Perform Pickups",
                description: "View assigned pickups, navigate to locations, and complete waste collection efficiently.",
                color: "primary",
                href: "/auth?role=collector",
              },
              {
                icon: Recycle,
                title: "NGO / Recycling Center",
                subtitle: "Receive Donations",
                description: "Accept donations from citizens and manage your organization's recycling operations.",
                color: "secondary",
                href: "/auth?role=ngo",
              },
            ].map((role, idx) => {
              const Icon = role.icon
              return (
                <motion.div key={idx} variants={itemVariants}>
                  <Card className="p-8 h-full flex flex-col hover:shadow-lg transition-all duration-300 ease-out border-2 hover:border-primary/50">
                    <div
                      className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 ${
                        role.color === "primary" ? "bg-primary/10" : "bg-secondary/10"
                      }`}
                    >
                      <Icon className={`w-7 h-7 ${role.color === "primary" ? "text-primary" : "text-secondary"}`} />
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{role.title}</h3>
                    <p
                      className={`text-sm font-semibold mb-3 ${role.color === "primary" ? "text-primary" : "text-secondary"}`}
                    >
                      {role.subtitle}
                    </p>
                    <p className="text-muted-foreground text-sm mb-6 flex-grow">{role.description}</p>
                    <div className="flex flex-col gap-3">
                      <Button asChild className="w-full btn-hover">
                        <Link href={role.href}>
                          Sign In
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full btn-hover bg-transparent">
                        <Link href={`${role.href}&signup=true`}>
                          Sign Up
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to manage waste responsibly
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Recycle,
                title: "Easy Scheduling",
                description: "Schedule pickups in seconds with our intuitive interface.",
              },
              {
                icon: TrendingUp,
                title: "Real-time Tracking",
                description: "Track your waste from pickup to recycling facility.",
              },
              {
                icon: Users,
                title: "NGO Partnerships",
                description: "Donate directly to verified NGOs and recycling centers.",
              },
              {
                icon: Droplet,
                title: "Impact Analytics",
                description: "See your environmental impact with detailed statistics.",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div key={idx} variants={itemVariants}>
                  <Card className="p-8 hover:shadow-lg transition-all duration-300 ease-out">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 md:py-32 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Impact</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Together, we're making a real difference</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { label: "Tons Recycled", value: tonsRecycled, suffix: "t" },
              { label: "CO₂ Saved", value: co2Saved, suffix: "kg" },
              { label: "NGOs Supported", value: ngosSupported, suffix: "+" },
            ].map((stat, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="p-8 text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                    {stat.value.toLocaleString()}
                    {stat.suffix}
                  </div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
