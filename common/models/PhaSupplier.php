<?php

namespace common\models;

use common\models\query\PhaSupplierQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pha_supplier".
 *
 * @property integer $supplier_id
 * @property integer $tenant_id
 * @property string $supplier_name
 * @property string $supplier_code
 * @property string $supplier_address
 * @property integer $city_id
 * @property integer $state_id
 * @property integer $country_id
 * @property string $zip
 * @property string $supplier_mobile
 * @property string $supplier_phone
 * @property string $cst_no
 * @property string $tin_no
 * @property string $drug_license
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoMasterCity $city
 * @property CoMasterCountry $country
 * @property CoMasterState $state
 * @property CoTenant $tenant
 */
class PhaSupplier extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_supplier';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['supplier_name', 'supplier_mobile', 'cst_no', 'tin_no', 'supplier_address'], 'required'],
                [['tenant_id', 'city_id', 'state_id', 'country_id', 'created_by', 'modified_by'], 'integer'],
                [['supplier_address', 'status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['supplier_name', 'cst_no', 'tin_no', 'drug_license'], 'string', 'max' => 100],
                [['supplier_code', 'supplier_mobile', 'supplier_phone'], 'string', 'max' => 50],
                [['zip'], 'string', 'max' => 30],
                [['tenant_id', 'supplier_name', 'deleted_at'], 'unique', 'targetAttribute' => ['tenant_id', 'supplier_name', 'deleted_at'], 'message' => 'The combination of Tenant ID, Supplier Name and Deleted At has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'supplier_id' => 'Supplier ID',
            'tenant_id' => 'Tenant ID',
            'supplier_name' => 'Supplier Name',
            'supplier_code' => 'Supplier Code',
            'supplier_address' => 'Supplier Address',
            'city_id' => 'City ID',
            'state_id' => 'State ID',
            'country_id' => 'Country ID',
            'zip' => 'Zip',
            'supplier_mobile' => 'Supplier Mobile',
            'supplier_phone' => 'Supplier Phone',
            'cst_no' => 'Cst No',
            'tin_no' => 'Tin No',
            'drug_license' => 'Drug License',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getCity() {
        return $this->hasOne(CoMasterCity::className(), ['city_id' => 'city_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getCountry() {
        return $this->hasOne(CoMasterCountry::className(), ['country_id' => 'country_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getState() {
        return $this->hasOne(CoMasterState::className(), ['state_id' => 'state_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new PhaSupplierQuery(get_called_class());
    }

    public static function getSupplierlist($tenant = null, $status = '1', $deleted = false) {
        if (!$deleted) {
            $list = self::find()->tenant($tenant)->status($status)->active()->all();
        } else {
            $list = self::find()->tenant($tenant)->deleted()->all();
        }

        return $list;
    }

    public static function getSupplierid($name, $tenant = null) {
        $supplier = self::find()->tenant($tenant)->andWhere(['supplier_name' => $name])->one();
        if (!$supplier) {
            $supplier = new PhaSupplier;
            $supplier->supplier_name = $name;
            $supplier->save(false);
        }
        return $supplier->supplier_id;
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Supplier Added Successfully (#' . $this->supplier_name . ' )';
        else
            $activity = 'Supplier Updated Successfully (#' . $this->supplier_name . ' )';
        CoAuditLog::insertAuditLog(PhaSupplier::tableName(), $this->supplier_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
