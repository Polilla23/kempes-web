import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'

const authCard = ({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) => {
  return (
    <div className="relative h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/Football-Field-Fake-Grass.jpg"
          alt="football field background"
          className="w-full h-full object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
      <Card className="relative z-10 bg-white/95 backdrop-blur-sm shadow-2xl flex flex-col justify-center px-8 w-full max-w-md">
        <CardHeader className="text-center pb-6">
          {/* Kempes Logo acá */}
          <CardTitle className="font-bold text-3xl text-gray-800">Kempes Master League</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">{description}</p>
          </div>
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

export default authCard
