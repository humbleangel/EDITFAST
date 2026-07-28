import { escapeXmlTags } from './xml'
import { extractUpdatedCode } from './parser'
import { FAST_APPLY_API_KEY, FAST_APPLY_URL, FAST_APPLY_MODEL } from './config'

export const FAST_APPLY_SYSTEM_PROMPT =
  'You are a code editing assistant. Your task is to merge the provided update snippet into the original code. Preserve all code structure, indentation, and comments that are not explicitly changed. Only modify the specific section described by the update. Output ONLY the merged code inside <updated-code> tags.'

export const FAST_APPLY_USER_PROMPT =
  '<original-code>{original_code}</original-code>\n\n<user-edit>{update_snippet}</user-edit>'

export async function callFastApply(
  originalCode: string,
  codeEdit: string,
): Promise<{ success: true; content: string } | { success: false; error: string }> {
  if (!FAST_APPLY_API_KEY() || FAST_APPLY_API_KEY() === 'optional-api-key') {
    return { success: false, error: 'FAST_APPLY_API_KEY not set or still using default value' }
  }

  const escapedOriginal = escapeXmlTags(originalCode)
  const escapedEdit = escapeXmlTags(codeEdit)

  const userPrompt = FAST_APPLY_USER_PROMPT
    .replace('{original_code}', escapedOriginal)
    .replace('{update_snippet}', escapedEdit)

  let response: Response
  try {
    response = await fetch(`${FAST_APPLY_URL()}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${FAST_APPLY_API_KEY()}`,
      },
      body: JSON.stringify({
        model: FAST_APPLY_MODEL(),
        messages: [
          { role: 'system', content: FAST_APPLY_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0,
      }),
    })
  } catch (err) {
    return { success: false, error: `Fast Apply API request failed: ${(err as Error).message}` }
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '(unable to read body)')
    return { success: false, error: `Fast Apply API error (${response.status}): ${body}` }
  }

  let json: unknown
  try {
    json = await response.json()
  } catch {
    return { success: false, error: 'Failed to parse API response JSON' }
  }

  const data = json as { choices?: Array<{ message?: { content?: string } }> }
  const rawContent = data?.choices?.[0]?.message?.content
  if (!rawContent) {
    return { success: false, error: 'API response missing choices[0].message.content' }
  }

  try {
    const mergedCode = extractUpdatedCode(rawContent)
    return { success: true, content: mergedCode }
  } catch (parseErr) {
    return { success: false, error: `Failed to parse AI response: ${(parseErr as Error).message}` }
  }
}
