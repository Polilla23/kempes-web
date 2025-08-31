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
        <div className="absolute inset-0 "></div>
      </div>
      <Card className="relative z-10  backdrop-blur-sm shadow-2xl flex flex-col justify-center px-8 w-full max-w-md">
        <CardHeader className="text-center pb-2">
          {/* Kempes Logo acá */}
          <CardTitle className="font-bold text-3xl text-gray-900 dark:text-gray-100">
            Kempes Master League
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h2>
            <p className="text-gray-700 dark:text-gray-300">{description}</p>
          </div>
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

export default authCard
