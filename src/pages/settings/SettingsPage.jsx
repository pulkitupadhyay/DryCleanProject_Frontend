import { useEffect, useState } from 'react'
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BellIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { Card, Button, Badge } from '../../components/common'
import api from '../../app/api'
import toast from 'react-hot-toast'

const SettingsPage = () => {
  const [whatsappStatus, setWhatsappStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchWhatsAppStatus()
  }, [])

  const fetchWhatsAppStatus = async () => {
    try {
      const response = await api.get('/whatsapp/status')
      setWhatsappStatus(response.data.data)
    } catch (error) {
      console.error('Failed to fetch WhatsApp status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage application settings and integrations</p>
      </div>

      {/* WhatsApp Integration */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">WhatsApp Business API</h2>
            <p className="text-sm text-gray-500">Send order notifications via WhatsApp</p>
          </div>
          <div className="ml-auto">
            {isLoading ? (
              <Badge variant="default">Checking...</Badge>
            ) : whatsappStatus?.configured ? (
              <Badge variant="success">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="warning">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                Not Configured
              </Badge>
            )}
          </div>
        </div>

        {!isLoading && whatsappStatus?.configured ? (
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              WhatsApp Business API is configured and ready to send notifications.
            </p>
            <p className="text-green-600 text-xs mt-1">
              Phone Number ID: {whatsappStatus.phoneNumberId}
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-yellow-800 text-sm font-medium mb-2">
              Setup Required
            </p>
            <p className="text-yellow-700 text-sm mb-3">
              To enable WhatsApp notifications, you need to configure the Meta WhatsApp Business API.
              Add the following environment variables to your server:
            </p>
            <div className="bg-yellow-100 rounded p-3 font-mono text-xs text-yellow-900">
              <p>WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id</p>
              <p>WHATSAPP_ACCESS_TOKEN=your-access-token</p>
              <p>WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-verify-token</p>
              <p>META_APP_SECRET=your-app-secret (optional)</p>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <h3 className="font-medium mb-3">Notification Triggers</h3>
          <div className="space-y-2">
            {[
              { event: 'Order Collected', description: 'When a new order is created' },
              { event: 'Order Ready', description: 'When order status changes to Ready' },
              { event: 'Order Delivered', description: 'When order is delivered' },
              { event: 'Pickup Reminder', description: 'Daily at 10 AM for orders ready 2+ days' }
            ].map((trigger) => (
              <div key={trigger.event} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium">{trigger.event}</p>
                  <p className="text-xs text-gray-500">{trigger.description}</p>
                </div>
                <Badge variant={whatsappStatus?.configured ? 'success' : 'default'} size="sm">
                  {whatsappStatus?.configured ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BellIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Notification Preferences</h2>
            <p className="text-sm text-gray-500">Configure when notifications are sent</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Send order confirmation</p>
              <p className="text-sm text-gray-500">Notify customer when order is collected</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Send ready notification</p>
              <p className="text-sm text-gray-500">Notify customer when order is ready for pickup</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Send pickup reminders</p>
              <p className="text-sm text-gray-500">Remind customers about orders ready for 2+ days</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* General Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Cog6ToothIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">General Settings</h2>
            <p className="text-sm text-gray-500">Application configuration</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Store Name</p>
              <p className="text-sm text-gray-500">ABC Dry Cleaners</p>
            </div>
            <Button variant="secondary" size="sm">Edit</Button>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Store Hours</p>
              <p className="text-sm text-gray-500">9:00 AM - 8:00 PM</p>
            </div>
            <Button variant="secondary" size="sm">Edit</Button>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Default Delivery Time</p>
              <p className="text-sm text-gray-500">24 hours</p>
            </div>
            <Button variant="secondary" size="sm">Edit</Button>
          </div>
        </div>
      </Card>

      {/* WhatsApp Setup Guide */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">WhatsApp Business API Setup Guide</h2>
        <div className="prose prose-sm max-w-none text-gray-600">
          <ol className="list-decimal list-inside space-y-3">
            <li>
              <strong>Create Meta Developer Account</strong>
              <p className="ml-5 text-sm">Go to developers.facebook.com and create a developer account</p>
            </li>
            <li>
              <strong>Create a Meta App</strong>
              <p className="ml-5 text-sm">Create a new app with &quot;Business&quot; type and add WhatsApp product</p>
            </li>
            <li>
              <strong>Configure WhatsApp Business</strong>
              <p className="ml-5 text-sm">Link your business portfolio and add your shop&apos;s phone number</p>
            </li>
            <li>
              <strong>Create Message Templates</strong>
              <p className="ml-5 text-sm">Create templates named: order_collected, order_ready, pickup_reminder</p>
            </li>
            <li>
              <strong>Configure Webhook</strong>
              <p className="ml-5 text-sm">Set webhook URL to: https://yourdomain.com/api/whatsapp/webhook</p>
            </li>
            <li>
              <strong>Add Environment Variables</strong>
              <p className="ml-5 text-sm">Add the API credentials to your server .env file</p>
            </li>
          </ol>
        </div>
      </Card>
    </div>
  )
}

export default SettingsPage
