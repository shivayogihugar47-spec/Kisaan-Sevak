import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Edit3, MapPin, Phone, Sprout, Tractor } from "lucide-react";
import DashboardShell from "../components/DashboardShell";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function FarmerProfilePage() {
  const navigate = useNavigate();
  const { profile, isAuthenticated, portal, updateSession } = useAuth();

  const phone = profile?.phone || "";
  const userRole = portal || profile?.role || "farmer";

  const [name, setName] = useState(profile?.name || "");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [bio, setBio] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [mainCrop, setMainCrop] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [farmingExperienceYears, setFarmingExperienceYears] = useState("");
  const [farmingType, setFarmingType] = useState("");
  const [irrigationType, setIrrigationType] = useState("");
  const [soilType, setSoilType] = useState("");
  const [primaryLanguage, setPrimaryLanguage] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [kycStatus, setKycStatus] = useState("pending");
  const [kycFullName, setKycFullName] = useState("");
  const [kycIdType, setKycIdType] = useState("");
  const [kycIdNumber, setKycIdNumber] = useState("");
  const [kycDocumentUrl, setKycDocumentUrl] = useState("");
  const [kycAddress, setKycAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSave = useMemo(() => Boolean(name.trim()) && Boolean(phone), [name, phone]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { data, error: fetchError } = await supabase
          .from("app_users")
          .select(
            "name, profile_image_url, bio, location_label, farm_size, main_crop, district, state, pincode, date_of_birth, gender, farming_experience_years, farming_type, irrigation_type, soil_type, primary_language, secondary_phone, whatsapp_number, kyc_status, kyc_full_name, kyc_id_type, kyc_id_number, kyc_document_url, kyc_address",
          )
          .eq("phone", phone)
          .maybeSingle();

        if (fetchError) throw new Error(fetchError.message || "Failed to load profile.");
        if (!cancelled && data) {
          setName(data.name || profile?.name || "");
          setProfileImageUrl(data.profile_image_url || "");
          setBio(data.bio || "");
          setLocationLabel(data.location_label || "");
          setFarmSize(data.farm_size || "");
          setMainCrop(data.main_crop || "");
          setDistrict(data.district || "");
          setStateName(data.state || "");
          setPincode(data.pincode || "");
          setDateOfBirth(data.date_of_birth || "");
          setGender(data.gender || "");
          setFarmingExperienceYears(
            data.farming_experience_years === null || data.farming_experience_years === undefined
              ? ""
              : String(data.farming_experience_years),
          );
          setFarmingType(data.farming_type || "");
          setIrrigationType(data.irrigation_type || "");
          setSoilType(data.soil_type || "");
          setPrimaryLanguage(data.primary_language || "");
          setSecondaryPhone(data.secondary_phone || "");
          setWhatsappNumber(data.whatsapp_number || "");
          setKycStatus(data.kyc_status || "pending");
          setKycFullName(data.kyc_full_name || "");
          setKycIdType(data.kyc_id_type || "");
          setKycIdNumber(data.kyc_id_number || "");
          setKycDocumentUrl(data.kyc_document_url || "");
          setKycAddress(data.kyc_address || "");
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (phone) load();
    else setLoading(false);

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, navigate, phone, profile?.name]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const hasKycPayload = Boolean(
        String(kycFullName || "").trim() &&
          String(kycIdType || "").trim() &&
          String(kycIdNumber || "").trim() &&
          String(kycDocumentUrl || "").trim(),
      );
      const nextKycStatus = hasKycPayload ? "submitted" : "pending";
      const { error: updateError } = await supabase
        .from("app_users")
        .update({
          name: name.trim(),
          profile_image_url: String(profileImageUrl || "").trim() || null,
          bio: String(bio || "").trim() || null,
          location_label: locationLabel.trim(),
          farm_size: String(farmSize || "").trim(),
          main_crop: String(mainCrop || "").trim(),
          district: String(district || "").trim() || null,
          state: String(stateName || "").trim() || null,
          pincode: String(pincode || "").trim() || null,
          date_of_birth: String(dateOfBirth || "").trim() || null,
          gender: String(gender || "").trim() || null,
          farming_experience_years: String(farmingExperienceYears || "").trim()
            ? Number(farmingExperienceYears)
            : null,
          farming_type: String(farmingType || "").trim() || null,
          irrigation_type: String(irrigationType || "").trim() || null,
          soil_type: String(soilType || "").trim() || null,
          primary_language: String(primaryLanguage || "").trim() || null,
          secondary_phone: String(secondaryPhone || "").trim() || null,
          whatsapp_number: String(whatsappNumber || "").trim() || null,
          kyc_status: nextKycStatus,
          kyc_full_name: String(kycFullName || "").trim() || null,
          kyc_id_type: String(kycIdType || "").trim() || null,
          kyc_id_number: String(kycIdNumber || "").trim() || null,
          kyc_document_url: String(kycDocumentUrl || "").trim() || null,
          kyc_address: String(kycAddress || "").trim() || null,
          kyc_submitted_at: hasKycPayload ? new Date().toISOString() : null,
          kyc_rejection_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq("phone", phone);

      if (updateError) throw new Error(updateError.message || "Failed to update profile.");
      setKycStatus(nextKycStatus);
      setSuccess(hasKycPayload ? "Profile and KYC details submitted." : "Profile updated.");
      updateSession({
        user: { name: name.trim() },
        profile: {
          name: name.trim(),
          profileImageUrl: String(profileImageUrl || "").trim(),
          locationLabel: locationLabel.trim(),
          farmSize: String(farmSize || "").trim(),
          mainCrop: String(mainCrop || "").trim(),
        },
        session: {
          name: name.trim(),
          profileImageUrl: String(profileImageUrl || "").trim(),
          locationLabel: locationLabel.trim(),
          farmSize: String(farmSize || "").trim(),
          mainCrop: String(mainCrop || "").trim(),
        },
      });
    } catch (e2) {
      setError(e2?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Please choose an image under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImageUrl(String(reader.result || ""));
      setError("");
    };
    reader.onerror = () => setError("Could not read selected image.");
    reader.readAsDataURL(file);
  }

  return (
    <DashboardShell
      badge="Profile"
      title="My profile"
      description="Manage your account, farm details, and contact information."
    >
      {loading ? (
        <section className="rounded-[28px] border border-leaf-100 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-leaf-700">Loading...</div>
        </section>
      ) : (
        <div className="space-y-4">
          <section className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="h-16 w-16 rounded-2xl border border-emerald-100 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-leaf-700 text-2xl font-black text-white">
                    {String(name || profile?.name || "U").trim().slice(0, 1).toUpperCase()}
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white bg-emerald-600 text-white shadow">
                  <Camera size={13} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-black text-slate-900">{name || "User"}</h2>
                <p className="truncate text-sm font-bold text-slate-500">{phone || "No phone linked"}</p>
                <p className="mt-1 text-[11px] font-black uppercase tracking-widest text-emerald-600">
                  {userRole} profile
                </p>
              </div>
            </div>
            {bio ? <p className="mt-4 text-sm font-semibold text-slate-600">{bio}</p> : null}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatPill icon={MapPin} label="Location" value={locationLabel || "Not set"} />
              <StatPill icon={Sprout} label="Main Crop" value={mainCrop || "Not set"} />
              <StatPill icon={Tractor} label="Farm Size" value={farmSize || "Not set"} />
              <StatPill icon={Phone} label="Contact" value={phone || "Not set"} />
            </div>
          </section>

          <section className="rounded-[28px] border border-leaf-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-slate-700">
              <Edit3 size={18} />
              <h3 className="text-base font-black text-slate-900">Edit details</h3>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                  Name *
                </span>
                <input
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                  className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                  Profile photo URL
                </span>
                <input
                  value={profileImageUrl}
                  onChange={(ev) => setProfileImageUrl(ev.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                  Bio
                </span>
                <textarea
                  value={bio}
                  onChange={(ev) => setBio(ev.target.value)}
                  rows={3}
                  placeholder="Tell others about your farm, crops, and goals"
                  className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-3 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                  Phone
                </span>
                <input
                  value={phone}
                  disabled
                  className="w-full rounded-2xl border border-leaf-100 bg-leaf-50 px-4 py-4 text-sm font-semibold text-leaf-600"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                  Location (Village/City)
                </span>
                <input
                  value={locationLabel}
                  onChange={(ev) => setLocationLabel(ev.target.value)}
                  placeholder="e.g. Belgaum"
                  className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    District
                  </span>
                  <input
                    value={district}
                    onChange={(ev) => setDistrict(ev.target.value)}
                    placeholder="e.g. Belagavi"
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    State
                  </span>
                  <input
                    value={stateName}
                    onChange={(ev) => setStateName(ev.target.value)}
                    placeholder="e.g. Karnataka"
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    Pincode
                  </span>
                  <input
                    value={pincode}
                    onChange={(ev) => setPincode(ev.target.value)}
                    placeholder="e.g. 590001"
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    Date of birth
                  </span>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(ev) => setDateOfBirth(ev.target.value)}
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    Gender
                  </span>
                  <select
                    value={gender}
                    onChange={(ev) => setGender(ev.target.value)}
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    Farm size
                  </span>
                  <input
                    value={farmSize}
                    onChange={(ev) => setFarmSize(ev.target.value)}
                    placeholder="e.g. 5 acres"
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    Main crop
                  </span>
                  <input
                    value={mainCrop}
                    onChange={(ev) => setMainCrop(ev.target.value)}
                    placeholder="e.g. Sugarcane"
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    Farming experience (years)
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={farmingExperienceYears}
                    onChange={(ev) => setFarmingExperienceYears(ev.target.value)}
                    placeholder="e.g. 12"
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    Farming type
                  </span>
                  <select
                    value={farmingType}
                    onChange={(ev) => setFarmingType(ev.target.value)}
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                  >
                    <option value="">Select</option>
                    <option value="Organic">Organic</option>
                    <option value="Natural">Natural</option>
                    <option value="Conventional">Conventional</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    Irrigation type
                  </span>
                  <input
                    value={irrigationType}
                    onChange={(ev) => setIrrigationType(ev.target.value)}
                    placeholder="e.g. Drip"
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    Soil type
                  </span>
                  <input
                    value={soilType}
                    onChange={(ev) => setSoilType(ev.target.value)}
                    placeholder="e.g. Black soil"
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    Primary language
                  </span>
                  <input
                    value={primaryLanguage}
                    onChange={(ev) => setPrimaryLanguage(ev.target.value)}
                    placeholder="e.g. Kannada"
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    Secondary phone
                  </span>
                  <input
                    value={secondaryPhone}
                    onChange={(ev) => setSecondaryPhone(ev.target.value)}
                    placeholder="Optional alternate number"
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    WhatsApp number
                  </span>
                  <input
                    value={whatsappNumber}
                    onChange={(ev) => setWhatsappNumber(ev.target.value)}
                    placeholder="Optional WhatsApp number"
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-amber-700">KYC details</p>
                <p className="mt-1 text-xs font-bold text-amber-800">
                  Status: <span className="uppercase">{kycStatus}</span>
                </p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                      KYC full name
                    </span>
                    <input
                      value={kycFullName}
                      onChange={(ev) => setKycFullName(ev.target.value)}
                      placeholder="As per ID document"
                      className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                      ID type
                    </span>
                    <select
                      value={kycIdType}
                      onChange={(ev) => setKycIdType(ev.target.value)}
                      className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                    >
                      <option value="">Select</option>
                      <option value="Aadhaar">Aadhaar</option>
                      <option value="PAN">PAN</option>
                      <option value="Voter ID">Voter ID</option>
                      <option value="Driving License">Driving License</option>
                    </select>
                  </label>
                </div>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                      ID number
                    </span>
                    <input
                      value={kycIdNumber}
                      onChange={(ev) => setKycIdNumber(ev.target.value)}
                      placeholder="Enter ID number"
                      className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                      Document URL
                    </span>
                    <input
                      value={kycDocumentUrl}
                      onChange={(ev) => setKycDocumentUrl(ev.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-4 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                    />
                  </label>
                </div>
                <label className="mt-3 block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-leaf-600">
                    KYC address
                  </span>
                  <textarea
                    rows={2}
                    value={kycAddress}
                    onChange={(ev) => setKycAddress(ev.target.value)}
                    placeholder="Address as per document"
                    className="w-full rounded-2xl border border-leaf-100 bg-white px-4 py-3 text-sm font-semibold text-leaf-800 outline-none transition focus:border-leaf-300"
                  />
                </label>
              </div>

              {error ? (
                <p className="rounded-2xl bg-soil-50 px-4 py-3 text-sm font-semibold text-soil-700">{error}</p>
              ) : null}
              {success ? (
                <p className="rounded-2xl bg-leaf-50 px-4 py-3 text-sm font-semibold text-leaf-700">{success}</p>
              ) : null}

              <button
                type="submit"
                disabled={!canSave || saving}
                className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-emerald-700 bg-emerald-700 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-800 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </form>
          </section>
        </div>
      )}
    </DashboardShell>
  );
}

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="flex items-center gap-1 text-slate-500">
        <Icon size={13} />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-1 truncate text-xs font-bold text-slate-800">{value}</p>
    </div>
  );
}

