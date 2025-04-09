/**
 * Server action for creating new credentials
 * This action handles the secure creation of credentials with encryption
 * of sensitive values
 */

"use server"

import { symmetricEncrypt } from "@/lib/encryption";
import prisma from "@/lib/prisma";
import { createCredentialSchema, createCredentialSchemaType } from "@/schema/credential";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Creates a new credential with encrypted value
 * @param form - Form data containing credential details
 * @throws Error if form validation fails, user is unauthenticated, or credential creation fails
 */
export async function CreateCredential (form : createCredentialSchemaType) {
    // Validate the form data against the schema
    const {success,data} = createCredentialSchema.safeParse(form);

    if(!success){
        throw new Error("invalid form data")
    }

    // Get the authenticated user's ID
    const {userId} = await auth();
    if(!userId){
        throw new Error("unauthenticated")
    }

    // Encrypt the sensitive credential value
    const encryptedValue = symmetricEncrypt(data.value);
    
    // Create the credential in the database
    const result = await prisma.credential.create({
        data:{
            userId,
            name: data.name,
            value: encryptedValue
        }
    })

    if(!result){
        throw new Error("failed to create credential")
    }

    // Revalidate the credentials page to reflect changes
    revalidatePath("/credentials")
}